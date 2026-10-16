import PDFDocument from "pdfkit";
import { ContactSubmissionStatus, Prisma, type ContactSubmission, type PrismaClient } from "@prisma/client";
import { Router, type Response } from "express";
import { z } from "zod";
import { isAdmin, requireAdminOrigin } from "../middleware/auth-middleware.js";
import { sendContactReply, SmtpConfigurationError } from "../mailer.js";

type ContactDelegate = PrismaClient["contactSubmission"];
type SendReply = (submission: ContactSubmission, message: string) => Promise<void>;

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(100).optional(),
  status: z.nativeEnum(ContactSubmissionStatus).optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(ContactSubmissionStatus),
}).strict();
const replySchema = z.object({
  message: z.string().trim().min(1).max(5000),
}).strict();
const contactIdSchema = z.string().uuid();

function isMissingRecord(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

type ContactExportRow = Pick<ContactSubmission, "name" | "email" | "phone" | "subject" | "message" | "status" | "createdAt">;

function createContactsPdf(contacts: ContactExportRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ autoFirstPage: false, margin: 48, size: "A4" });
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.addPage();
    document.font("Helvetica-Bold").fontSize(20).text("JCC City Altar — Contact Messages");
    document.moveDown(0.35);
    document.font("Helvetica").fontSize(9)
      .fillColor("#555555")
      .text(`Exported ${new Date().toLocaleString()} · ${contacts.length} messages`);
    document.moveDown(1.2);

    if (contacts.length === 0) {
      document.fillColor("#222222").fontSize(11).text("No contact messages have been received.");
    }

    const contentWidth = document.page.width - document.page.margins.left - document.page.margins.right;
    for (const contact of contacts) {
      const lines = [
        contact.name,
        `Email: ${contact.email}`,
        ...(contact.phone ? [`Phone: ${contact.phone}`] : []),
        `Subject: ${contact.subject}`,
        `Status: ${contact.status.toLowerCase()}`,
        `Received: ${contact.createdAt.toLocaleString()}`,
        contact.message,
      ].join("\n");
      const blockHeight = document.heightOfString(lines, { width: contentWidth, lineGap: 3 }) + 30;
      if (document.y + blockHeight > document.page.height - document.page.margins.bottom) {
        document.addPage();
      }

      document.font("Helvetica-Bold").fontSize(11).fillColor("#222222").text(contact.name);
      document.font("Helvetica").fontSize(8).fillColor("#555555")
        .text(`Email: ${contact.email}${contact.phone ? ` · Phone: ${contact.phone}` : ""}`);
      document.text(`Subject: ${contact.subject}`);
      document.text(`Status: ${contact.status.toLowerCase()} · Received: ${contact.createdAt.toLocaleString()}`);
      document.moveDown(0.35);
      document.fontSize(10).fillColor("#222222").text(contact.message, { width: contentWidth, lineGap: 3 });
      document.moveDown(0.9);
      document.strokeColor("#dddddd").moveTo(document.page.margins.left, document.y)
        .lineTo(document.page.width - document.page.margins.right, document.y).stroke();
      document.moveDown(0.8);
    }

    document.end();
  });
}

function sendContactsPdf(response: Response, pdf: Buffer) {
  response
    .status(200)
    .set("Content-Type", "application/pdf")
    .set("Content-Disposition", 'attachment; filename="jcc-city-altar-contact-messages.pdf"')
    .set("Cache-Control", "private, no-store")
    .send(pdf);
}

export function createAdminContactsRouter(
  prisma: Pick<PrismaClient, "contactSubmission" | "user">,
  jwtSecret: string | undefined,
  adminOrigin: string,
  sendReply: SendReply = sendContactReply,
) {
  const router = Router();
  const contacts: ContactDelegate = prisma.contactSubmission;
  router.use(requireAdminOrigin(adminOrigin));
  router.use(isAdmin(prisma, jwtSecret));

  router.get("/export.pdf", async (_request, response, next) => {
    try {
      const contactRows = await contacts.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
        },
      });
      sendContactsPdf(response, await createContactsPdf(contactRows));
    } catch (error) {
      next(error);
    }
  });

  router.get("/stats", async (_request, response, next) => {
    try {
      const [totalRequests, pendingCount, inProgressCount, respondedCount] = await Promise.all([
        contacts.count(),
        contacts.count({ where: { status: ContactSubmissionStatus.PENDING } }),
        contacts.count({ where: { status: ContactSubmissionStatus.IN_PROGRESS } }),
        contacts.count({ where: { status: ContactSubmissionStatus.RESPONDED } }),
      ]);
      response.json({ totalRequests, pendingCount, inProgressCount, respondedCount, asOf: new Date() });
    } catch (error) {
      next(error);
    }
  });

  router.get("/", async (request, response, next) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      response.status(400).json({
        error: "Invalid query parameters",
        details: parsed.error.issues.map(({ path, message }) => ({ path, message })),
      });
      return;
    }

    const { page, limit, search, status } = parsed.data;
    const where: Prisma.ContactSubmissionWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    try {
      const [data, totalItems] = await Promise.all([
        contacts.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        contacts.count({ where }),
      ]);

      response.json({
        data,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/reply", async (request, response, next) => {
    const id = contactIdSchema.safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ error: "Invalid contact ID" });
      return;
    }

    const parsed = replySchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: "Invalid reply",
        details: parsed.error.issues.map(({ path, message }) => ({ path, message })),
      });
      return;
    }

    try {
      const contact = await contacts.findUnique({ where: { id: id.data } });
      if (!contact) {
        response.status(404).json({ error: "Contact submission not found" });
        return;
      }

      await sendReply(contact, parsed.data.message);
      response.status(200).json({ sent: true });
    } catch (error) {
      if (error instanceof SmtpConfigurationError) {
        response.status(503).json({ error: error.message });
        return;
      }
      next(error);
    }
  });

  router.patch("/:id", async (request, response, next) => {
    const id = contactIdSchema.safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ error: "Invalid contact ID" });
      return;
    }

    const parsed = updateStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        error: "Invalid contact status",
        details: parsed.error.issues.map(({ path, message }) => ({ path, message })),
      });
      return;
    }

    try {
      const contact = await contacts.update({
        where: { id: id.data },
        data: { status: parsed.data.status },
      });
      response.json(contact);
    } catch (error) {
      if (isMissingRecord(error)) {
        response.status(404).json({ error: "Contact submission not found" });
        return;
      }
      next(error);
    }
  });

  router.delete("/:id", async (request, response, next) => {
    const id = contactIdSchema.safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ error: "Invalid contact ID" });
      return;
    }

    try {
      await contacts.delete({ where: { id: id.data } });
      response.status(204).end();
    } catch (error) {
      if (isMissingRecord(error)) {
        response.status(404).json({ error: "Contact submission not found" });
        return;
      }
      next(error);
    }
  });

  return router;
}