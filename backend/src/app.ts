import express, { type ErrorRequestHandler } from "express";
import { rateLimit, type Options } from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import type { ContactSubmission, PrismaClient } from "@prisma/client";
import { contactSubmissionSchema } from "./contact-validation.js";
import { decodeProfileImage, feedbackSubmissionSchema } from "./feedback-validation.js";
import { notifyContact } from "./mailer.js";
import type { ProfileImageStorage } from "./profile-image-storage.js";

type AppOptions = {
  prisma: Pick<PrismaClient, "contactSubmission" | "feedback">;
  notify?: (submission: ContactSubmission) => Promise<void>;
  logger?: Pick<Console, "error">;
  rateLimitOptions?: Partial<Options>;
  profileImageStorage?: ProfileImageStorage;
};

export function createApp({
  prisma,
  notify = notifyContact,
  logger = console,
  rateLimitOptions = {},
  profileImageStorage,
}: AppOptions) {
  const app = express();

  app.use(helmet());

  app.post(
    "/api/feedback",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 3,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (_request, response) =>
        response.status(429).json({ error: "Too many feedback submissions. Please try again later." }),
      ...rateLimitOptions,
    }),
    express.json({ limit: "15mb" }),
    async (request, response, next) => {
      const parsed = feedbackSubmissionSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(400).json({
          error: "Invalid feedback submission",
          details: parsed.error.issues.map(({ path, message }) => ({ path, message })),
        });
        return;
      }

      const { profileImage, ...feedbackData } = parsed.data;
      const imageBytes = profileImage ? decodeProfileImage(profileImage) : null;
      if (profileImage && !imageBytes) {
        response.status(400).json({ error: "Profile picture must be a valid JPEG, PNG, or WebP image no larger than 10 MB." });
        return;
      }

      let uploadedProfileImagePath: string | undefined;
      try {
        const feedbackId = profileImage && imageBytes ? crypto.randomUUID() : undefined;
        const profileImagePath = profileImage && imageBytes
          ? `${feedbackId}.${profileImage.mimeType === "image/jpeg" ? "jpg" : profileImage.mimeType.slice(6)}`
          : undefined;
        if (profileImagePath && !profileImageStorage) {
          response.status(503).json({ error: "Profile image storage is not configured" });
          return;
        }
        if (profileImagePath && profileImage && imageBytes && profileImageStorage) {
          await profileImageStorage.upload(profileImagePath, imageBytes, profileImage.mimeType);
          uploadedProfileImagePath = profileImagePath;
        }

        const feedback = await prisma.feedback.create({
          data: {
            ...(feedbackId ? { id: feedbackId } : {}),
            ...feedbackData,
            ...(profileImage && imageBytes
              ? { profileImagePath, profileImageType: profileImage.mimeType }
              : {}),
          },
          select: { id: true, createdAt: true },
        });
        uploadedProfileImagePath = undefined;
        response.status(201).json(feedback);
      } catch (error) {
        if (uploadedProfileImagePath && profileImageStorage) {
          await profileImageStorage.remove(uploadedProfileImagePath)
            .catch((cleanupError) => logger.error("Profile image cleanup failed", cleanupError));
        }
        next(error);
      }
    },
  );

  app.use(express.json({ limit: "10kb" }));

  app.post(
    "/api/contacts",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (_request, response) =>
        response.status(429).json({ error: "Too many submissions. Please try again later." }),
      ...rateLimitOptions,
    }),
    async (request, response, next) => {
      const parsed = contactSubmissionSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(400).json({
          error: "Invalid contact submission",
          details: parsed.error.issues.map(({ path, message }) => ({ path, message })),
        });
        return;
      }

      try {
        const submission = await prisma.contactSubmission.create({ data: parsed.data });
        try {
          await notify(submission);
        } catch (error) {
          logger.error("Contact notification delivery failed", error);
        }

        response.status(201).json({
          id: submission.id,
          createdAt: submission.createdAt,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.get("/api/feedback", async (_request, response, next) => {
    try {
      const data = await prisma.feedback.findMany({
        where: { status: "APPROVED", featured: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, message: true, profileImageType: true, createdAt: true },
      });
      response.json({ data });
    } catch (error) {
      next(error);
    }
  });

  app.get(
    "/api/feedback/:id/profile-picture",
    async (request, response, next) => {
      const id = z.string().uuid().safeParse(request.params.id);
      if (!id.success) {
        response.status(400).json({ error: "Invalid feedback ID" });
        return;
      }
      try {
        const feedback = await prisma.feedback.findUnique({
          where: { id: id.data },
          select: {
            status: true,
            featured: true,
            profileImage: true,
            profileImagePath: true,
            profileImageType: true,
          },
        });
        if ((!feedback?.profileImage && !feedback?.profileImagePath) || !feedback.profileImageType ||
          feedback.status !== "APPROVED" || !feedback.featured) {
          response.status(404).json({ error: "Profile picture not found" });
          return;
        }
        const imageBytes = feedback.profileImagePath
          ? await profileImageStorage?.download(feedback.profileImagePath)
          : feedback.profileImage;
        if (!imageBytes) {
          response.status(503).json({ error: "Profile image storage is not configured" });
          return;
        }
        response.set("Content-Type", feedback.profileImageType);
        response.set("Cache-Control", "public, max-age=3600");
        response.send(Buffer.from(imageBytes));
      } catch (error) {
        next(error);
      }
    },
  );

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof SyntaxError && "status" in error && error.status === 400 && "body" in error) {
      response.status(400).json({ error: "Malformed JSON request body" });
      return;
    }
    if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.too.large") {
      response.status(413).json({ error: "Request body is too large" });
      return;
    }

    logger.error("Unhandled API error", error);
    response.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  return app;
}