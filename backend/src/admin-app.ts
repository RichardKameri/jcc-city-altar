import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import type { ContactSubmission, PrismaClient } from "@prisma/client";
import { getAllowedOrigins, normalizeOrigin } from "./middleware/auth-middleware.js";
import { createAdminAuthRouter } from "./routes/admin-auth.js";
import { createAdminContactsRouter } from "./routes/admin-contacts.js";
import { createAdminFeedbackRouter } from "./routes/admin-feedback.js";
import type { ProfileImageStorage } from "./profile-image-storage.js";
import { sendContactReply } from "./mailer.js";

type AdminAppOptions = {
  prisma: Pick<PrismaClient, "user" | "contactSubmission" | "feedback" | "adminInvitation" | "$transaction">;
  jwtSecret?: string;
  adminOrigin?: string;
  secureCookies?: boolean;
  sendReply?: (submission: ContactSubmission, message: string) => Promise<void>;
  profileImageStorage?: ProfileImageStorage;
};

export function createAdminApp({
  prisma,
  jwtSecret = process.env.ADMIN_JWT_SECRET,
  adminOrigin = process.env.ADMIN_ORIGIN ?? "http://localhost:5174",
  secureCookies,
  sendReply = sendContactReply,
  profileImageStorage,
}: AdminAppOptions) {
  const app = express();
  const allowedOrigins = getAllowedOrigins(adminOrigin);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(normalizeOrigin(origin)));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }));
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());

  app.use("/api/admin/auth", createAdminAuthRouter(prisma, jwtSecret, adminOrigin, secureCookies));
  app.use("/api/admin/contacts", createAdminContactsRouter(prisma, jwtSecret, adminOrigin, sendReply));
  app.use("/api/admin/feedback", createAdminFeedbackRouter(prisma, jwtSecret, adminOrigin, profileImageStorage));

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof SyntaxError && "status" in error && error.status === 400 && "body" in error) {
      response.status(400).json({ error: "Malformed JSON request body" });
      return;
    }
    if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.too.large") {
      response.status(413).json({ error: "Request body is too large" });
      return;
    }
    console.error("Unhandled admin API error", error);
    response.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  return app;
}