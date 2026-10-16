import PDFDocument from "pdfkit";
import { FeedbackStatus, type Feedback, type PrismaClient } from "@prisma/client";
import { Router, type Response } from "express";
import { z } from "zod";
import { isAdmin, requireAdminOrigin } from "../middleware/auth-middleware.js";

const feedbackIdSchema = z.string().uuid();
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(FeedbackStatus).optional(),
});
const updateFeedbackSchema = z.object({
  status: z.nativeEnum(FeedbackStatus).optional(),
  featured: z.boolean().optional(),
}).strict().refine((value) => value.status !== undefined || value.featured !== undefined);

type FeedbackExportRow = Pick<Feedback, "name" | "message" | "status" | "featured" | "createdAt">;

function createFeedbackPdf(feedback: FeedbackExportRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ autoFirstPage: false, margin: 48, size: "A4" });
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.addPage();
    document.font("Helvetica-Bold").fontSize(20).text("JCC City Altar — Community Feedback");
    document.moveDown(0.35);
    document.font("Helvetica").fontSize(9)
      .fillColor("#555555")
      .text(`Exported ${new Date().toLocaleString()} · ${feedback.length} submissions`);
    document.moveDown(1.2);

    if (feedback.length === 0) {
      document.fillColor("#222222").fontSize(11).text("No feedback has been submitted.");
    }

    const contentWidth = document.page.width - document.page.margins.left - document.page.margins.right;
    for (const item of feedback) {
      const lines = [
        item.name,
        `Status: ${item.status.toLowerCase()}${item.featured ? " · Featured on About page" : ""}`,
        `Submitted: ${item.createdAt.toLocaleString()}`,
        item.message,
      ].join("\n");
      const blockHeight = document.heightOfString(lines, { width: contentWidth, lineGap: 3 }) + 24;
      if (document.y + blockHeight > document.page.height - document.page.margins.bottom) {
        document.addPage();
      }
      document.font("Helvetica").fontSize(10).fillColor("#222222").text(item.name, { continued: false });
      document.font("Helvetica").fontSize(8).fillColor("#555555")
        .text(`Status: ${item.status.toLowerCase()}${item.featured ? " · Featured on About page" : ""}`);
      document.text(`Submitted: ${item.createdAt.toLocaleString()}`);
      document.moveDown(0.3);
      document.font("Helvetica").fontSize(10).fillColor("#222222")
        .text(item.message, { width: contentWidth, lineGap: 3 });
      document.moveDown(0.9);
      document.strokeColor("#dddddd").moveTo(document.page.margins.left, document.y)
        .lineTo(document.page.width - document.page.margins.right, document.y).stroke();
      document.moveDown(0.8);
    }
    document.end();
  });
}

function sendPdf(response: Response, pdf: Buffer) {
  response
    .status(200)
    .set("Content-Type", "application/pdf")
    .set("Content-Disposition", 'attachment; filename="jcc-city-altar-feedback.pdf"')
    .set("Cache-Control", "private, no-store")
    .send(pdf);
}

export function createAdminFeedbackRouter(
  prisma: Pick<PrismaClient, "feedback" | "user">,
  jwtSecret: string | undefined,
  adminOrigin: string,
) {
  const router = Router();
  router.use(requireAdminOrigin(adminOrigin));
  router.use(isAdmin(prisma, jwtSecret));

  router.get("/export.pdf", async (_request, response, next) => {
    try {
      const feedback = await prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        select: { name: true, message: true, status: true, featured: true, createdAt: true },
      });
      sendPdf(response, await createFeedbackPdf(feedback));
    } catch (error) {
      next(error);
    }
  });

  router.get("/", async (request, response, next) => {
    const parsed = listQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid feedback filter" });
      return;
    }

    try {
      const { page, limit, status } = parsed.data;
      const where = status ? { status } : {};
      const [data, totalItems] = await Promise.all([
        prisma.feedback.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            message: true,
            profileImageType: true,
            status: true,
            featured: true,
            createdAt: true,
          },
        }),
        prisma.feedback.count({ where }),
      ]);
      response.json({
        data,
        pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/profile-picture", async (request, response, next) => {
    const id = feedbackIdSchema.safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ error: "Invalid feedback ID" });
      return;
    }

    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id: id.data },
        select: { profileImage: true, profileImageType: true },
      });
      if (!feedback?.profileImage || !feedback.profileImageType) {
        response.status(404).json({ error: "Profile picture not found" });
        return;
      }
      response.set("Content-Type", feedback.profileImageType);
      response.set("Cache-Control", "private, no-store");
      response.send(feedback.profileImage);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (request, response, next) => {
    const id = feedbackIdSchema.safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ error: "Invalid feedback ID" });
      return;
    }

    const parsed = updateFeedbackSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid feedback update" });
      return;
    }

    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id: id.data },
        select: { id: true, status: true, featured: true },
      });
      if (!feedback) {
        response.status(404).json({ error: "Feedback not found" });
        return;
      }

      const status = parsed.data.status ?? feedback.status;
      if (parsed.data.featured === true && status !== FeedbackStatus.APPROVED) {
        response.status(400).json({ error: "Only approved feedback can be featured" });
        return;
      }

      const updated = await prisma.feedback.update({
        where: { id: id.data },
        data: {
          ...(parsed.data.status ? { status: parsed.data.status } : {}),
          ...(status !== FeedbackStatus.APPROVED
            ? { featured: false }
            : parsed.data.featured !== undefined
              ? { featured: parsed.data.featured }
              : {}),
        },
        select: {
          id: true,
          name: true,
          message: true,
          profileImageType: true,
          status: true,
          featured: true,
          createdAt: true,
        },
      });
      response.json(updated);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
