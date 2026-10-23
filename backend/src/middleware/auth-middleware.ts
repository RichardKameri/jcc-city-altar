import type { User, PrismaClient } from "@prisma/client";
import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const ADMIN_SESSION_COOKIE = "jcc_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

declare global {
  namespace Express {
    interface Request {
      adminUser?: Pick<User, "id" | "email" | "role">;
    }
  }
}

export function assertJwtSecret(secret: string | undefined): asserts secret is string {
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("ADMIN_JWT_SECRET must contain at least 32 bytes");
  }
}

export function signAdminSession(userId: string, secret: string): string {
  assertJwtSecret(secret);
  return jwt.sign({}, secret, {
    algorithm: "HS256",
    subject: userId,
    issuer: "jcc-admin-api",
    audience: "jcc-admin-panel",
    expiresIn: ADMIN_SESSION_TTL_SECONDS,
  });
}

/** Lowercases scheme/host and strips trailing slashes, e.g. "https://x.dev/" -> "https://x.dev". */
export function normalizeOrigin(value: string): string {
  const trimmed = value.trim();
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

/** ADMIN_ORIGIN plus any comma-separated ADMIN_EXTRA_ORIGINS. */
export function getAllowedOrigins(adminOrigin: string): string[] {
  const extra = (process.env.ADMIN_EXTRA_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([adminOrigin, ...extra].map(normalizeOrigin))];
}

export function requireAdminOrigin(adminOrigin: string): RequestHandler {
  const allowed = getAllowedOrigins(adminOrigin);

  return (request, response, next) => {
    const isProduction = process.env.NODE_ENV === "production";
    const origin = request.get("origin");
    const fetchSite = request.get("sec-fetch-site");

    if (origin) {
      if (allowed.includes(normalizeOrigin(origin))) {
        next();
        return;
      }

      if (!isProduction && fetchSite === "same-origin") {
        console.warn("[admin-origin] dev fallback: allowing same-origin request", { origin, allowed });
        next();
        return;
      }

      console.warn("[admin-origin] rejected", { origin, allowed, fetchSite });
      response.status(403).json({ error: "Origin not allowed" });
      return;
    }

    if (fetchSite === "same-origin") {
      next();
      return;
    }

    if (isProduction) {
      response.status(403).json({ error: "Origin required" });
      return;
    }
    next();
  };
}

export function isAdmin(prisma: Pick<PrismaClient, "user">, secret: string | undefined): RequestHandler {
  return async (request, response, next) => {
    try {
      assertJwtSecret(secret);
    } catch {
      response.status(503).json({ error: "Admin authentication is not configured" });
      return;
    }

    const token = request.cookies?.[ADMIN_SESSION_COOKIE];
    if (typeof token !== "string") {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    let payload: JwtPayload;
    try {
      const verified = jwt.verify(token, secret, {
        algorithms: ["HS256"],
        issuer: "jcc-admin-api",
        audience: "jcc-admin-panel",
      });
      if (typeof verified === "string" || typeof verified.sub !== "string") {
        response.status(401).json({ error: "Invalid session" });
        return;
      }
      payload = verified;
    } catch {
      response.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true },
      });
      if (!user) {
        response.status(401).json({ error: "Account no longer exists" });
        return;
      }
      if (user.role !== "ADMIN") {
        response.status(403).json({ error: "Administrator role required" });
        return;
      }

      request.adminUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}