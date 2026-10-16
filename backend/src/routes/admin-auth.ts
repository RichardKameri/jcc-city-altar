import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import { Router } from "express";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  isAdmin,
  requireAdminOrigin,
  signAdminSession,
} from "../middleware/auth-middleware.js";

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
}).strict();

const invitationSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
}).strict();

const signupSchema = z.object({
  token: z.string().min(40).max(100),
  password: z.string().min(14).max(128),
}).strict();

const INVITATION_TTL_MS = 24 * 60 * 60 * 1000;

function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createAdminAuthRouter(
  prisma: Pick<PrismaClient, "user" | "adminInvitation" | "$transaction">,
  jwtSecret: string | undefined,
  adminOrigin: string,
  secureCookies = process.env.NODE_ENV === "production",
) {
  const router = Router();
  const originGuard = requireAdminOrigin(adminOrigin);
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many login attempts. Please try again later." },
  });
  const invitationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many invitation requests. Please try again later." },
  });
  const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many signup attempts. Please try again later." },
  });

  router.post("/invitations", originGuard, isAdmin(prisma, jwtSecret), invitationLimiter, async (request, response, next) => {
    const parsed = invitationSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid invitation request" });
      return;
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (existingUser) {
        response.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const token = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
      await prisma.adminInvitation.create({
        data: {
          email: parsed.data.email,
          tokenHash: hashInvitationToken(token),
          expiresAt,
          createdById: request.adminUser!.id,
        },
      });
      const invitationUrl = new URL("/signup", adminOrigin);
      invitationUrl.hash = new URLSearchParams({ invite: token }).toString();
      response.status(201).json({ email: parsed.data.email, invitationUrl: invitationUrl.toString(), expiresAt });
    } catch (error) {
      next(error);
    }
  });

  router.post("/signup", originGuard, signupLimiter, async (request, response, next) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid signup request. Passwords must be at least 14 characters." });
      return;
    }

    try {
      const result = await prisma.$transaction(async (transaction) => {
        const tokenHash = hashInvitationToken(parsed.data.token);
        const invitation = await transaction.adminInvitation.findUnique({ where: { tokenHash } });
        const now = new Date();
        if (!invitation || invitation.usedAt || invitation.expiresAt <= now) {
          return { error: "This invitation is invalid, expired, or already used." };
        }

        const passwordHash = await bcrypt.hash(parsed.data.password, 12);
        const claimed = await transaction.adminInvitation.updateMany({
          where: { id: invitation.id, usedAt: null, expiresAt: { gt: now } },
          data: { usedAt: now },
        });
        if (claimed.count !== 1) {
          return { error: "This invitation is invalid, expired, or already used." };
        }

        const user = await transaction.user.create({
          data: { email: invitation.email, passwordHash, role: "ADMIN" },
          select: { id: true, email: true, role: true },
        });
        return { user };
      });
      if ("error" in result) {
        response.status(400).json({ error: result.error });
        return;
      }
      response.status(201).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", originGuard, loginLimiter, async (request, response, next) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid login request" });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
        response.status(401).json({ error: "Invalid email or password" });
        return;
      }
      if (user.role !== "ADMIN") {
        response.status(403).json({ error: "Administrator role required" });
        return;
      }

      const token = signAdminSession(user.id, jwtSecret ?? "");
      response.cookie(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: secureCookies,
        sameSite: "strict",
        path: "/api/admin",
        maxAge: ADMIN_SESSION_TTL_SECONDS * 1000,
      });
      response.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", isAdmin(prisma, jwtSecret), (request, response) => {
    response.json({ user: request.adminUser });
  });

  router.post("/logout", originGuard, (_request, response) => {
    response.clearCookie(ADMIN_SESSION_COOKIE, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: "strict",
      path: "/api/admin",
    });
    response.status(204).end();
  });

  return router;
}