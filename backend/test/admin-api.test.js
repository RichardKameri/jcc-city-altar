import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { test } from "node:test";
import request from "supertest";
import { UserRole } from "@prisma/client";
import { createAdminApp } from "../src/admin-app.js";
import { signAdminSession, ADMIN_SESSION_COOKIE } from "../src/middleware/auth-middleware.js";

const JWT_SECRET = "test-jwt-secret-with-at-least-thirty-two-bytes-long";
const ADMIN_ORIGIN = "http://localhost:5174";
const ADMIN_ID = "123e4567-e89b-42d3-a456-426614174000";
const USER_ID = "123e4567-e89b-42d3-a456-426614174001";
const CONTACT_ID = "123e4567-e89b-42d3-a456-426614174002";
const FEEDBACK_ID = "123e4567-e89b-42d3-a456-426614174003";
const ADMIN_PASSWORD = "correct-horse-battery-staple";
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 4);

function setup({ role = UserRole.ADMIN, deleteContact, updateContact, sendReply, profileImageStorage, feedbackImage } = {}) {
  const calls = {};
  const feedbackItems = [{
    id: FEEDBACK_ID,
    name: "Avery Example",
    message: "The community has been very welcoming.",
    status: "PENDING",
    featured: false,
    createdAt: new Date(),
    profileImage: null,
    profileImagePath: null,
    profileImageType: null,
    ...feedbackImage,
  }];
  const users = [
    { id: ADMIN_ID, email: "admin@example.com", passwordHash, role, createdAt: new Date() },
    { id: USER_ID, email: "member@example.com", passwordHash, role: UserRole.USER, createdAt: new Date() },
  ];
  const invitations = [];
  const prisma = {
    user: {
      findUnique: async ({ where, select }) => {
        const user = users.find((candidate) => candidate.id === where.id || candidate.email === where.email) ?? null;
        if (!user || !select) return user;
        return Object.fromEntries(Object.keys(select).map((key) => [key, user[key]]));
      },
      create: async ({ data, select }) => {
        const user = { id: `new-user-${users.length}`, ...data, createdAt: new Date() };
        users.push(user);
        return Object.fromEntries(Object.keys(select).map((key) => [key, user[key]]));
      },
    },
    adminInvitation: {
      create: async ({ data }) => {
        const invitation = { id: `invitation-${invitations.length}`, ...data, usedAt: null };
        invitations.push(invitation);
        return invitation;
      },
      findUnique: async ({ where }) => invitations.find((invitation) => invitation.tokenHash === where.tokenHash) ?? null,
      updateMany: async ({ where, data }) => {
        const invitation = invitations.find((candidate) =>
          candidate.id === where.id &&
          candidate.usedAt === where.usedAt &&
          candidate.expiresAt > where.expiresAt.gt,
        );
        if (!invitation) return { count: 0 };
        Object.assign(invitation, data);
        return { count: 1 };
      },
    },
    contactSubmission: {
      findMany: async (args) => {
        calls.findMany = args;
        return args.select
          ? [{
              name: "Avery Example",
              email: "avery@example.com",
              phone: "+1 555 123 4567",
              subject: "Service times",
              message: "Could you share the schedule?",
              status: "PENDING",
              createdAt: new Date("2026-01-01T00:00:00Z"),
            }]
          : [];
      },
      findUnique: async ({ where }) => where.id === CONTACT_ID
        ? {
            id: CONTACT_ID,
            name: "Avery Example",
            email: "avery@example.com",
            phone: "+1 555 123 4567",
            subject: "Service times",
            message: "Could you share the schedule?",
            status: "PENDING",
            createdAt: new Date(),
          }
        : null,
      count: async (args) => {
        calls.count ??= [];
        calls.count.push(args);
        if (args?.where?.status === "PENDING") return 3;
        if (args?.where?.status === "IN_PROGRESS") return 2;
        if (args?.where?.status === "RESPONDED") return 4;
        return 9;
      },
      update: updateContact ?? (async (args) => ({ id: args.where.id, ...args.data })),
      delete: deleteContact ?? (async (args) => ({ id: args.where.id })),
    },
    feedback: {
      findMany: async (args) => {
        calls.findFeedbackMany = args;
        return feedbackItems
          .filter((item) => !args.where?.status || item.status === args.where.status)
          .slice(args.skip ?? 0, args.take === undefined ? undefined : (args.skip ?? 0) + args.take);
      },
      count: async ({ where }) => feedbackItems.filter((item) => !where.status || item.status === where.status).length,
      findUnique: async ({ where }) => feedbackItems.find((item) => item.id === where.id) ?? null,
      update: async ({ where, data }) => {
        const item = feedbackItems.find((entry) => entry.id === where.id);
        if (!item) throw Object.assign(new Error("missing"), { code: "P2025" });
        Object.assign(item, data);
        return item;
      },
    },
    $transaction: async (callback) => callback(prisma),
  };
  const app = createAdminApp({
    prisma,
    jwtSecret: JWT_SECRET,
    adminOrigin: ADMIN_ORIGIN,
    secureCookies: false,
    sendReply,
    profileImageStorage,
  });
  return { app, calls, users, invitations };
}

function sessionCookie(userId = ADMIN_ID) {
  return `${ADMIN_SESSION_COOKIE}=${signAdminSession(userId, JWT_SECRET)}`;
}

function parseBufferResponse(response, callback) {
  const chunks = [];
  response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  response.on("end", () => callback(null, Buffer.concat(chunks)));
}

test("admin login issues an HttpOnly session cookie and /me returns the database user", async () => {
  const { app } = setup();
  const login = await request(app)
    .post("/api/admin/auth/login")
    .set("Origin", ADMIN_ORIGIN)
    .send({ email: "ADMIN@example.com", password: ADMIN_PASSWORD });

  assert.equal(login.status, 200);
  assert.equal(login.body.user.role, "ADMIN");
  assert.match(login.headers["set-cookie"][0], /HttpOnly/i);
  assert.match(login.headers["set-cookie"][0], /SameSite=Strict/i);

  const me = await request(app)
    .get("/api/admin/auth/me")
    .set("Cookie", login.headers["set-cookie"][0].split(";")[0]);
  assert.equal(me.status, 200);
  assert.deepEqual(me.body.user, { id: ADMIN_ID, email: "admin@example.com", role: "ADMIN" });
});

test("admin signup requires a valid invitation", async () => {
  const { app } = setup();
  const signup = await request(app)
    .post("/api/admin/auth/signup")
    .set("Origin", ADMIN_ORIGIN)
    .send({ password: "StrongPass123456!" });

  assert.equal(signup.status, 400);
});

test("only an authenticated administrator can create signup invitations", async () => {
  const { app } = setup();
  const unauthenticated = await request(app)
    .post("/api/admin/auth/invitations")
    .set("Origin", ADMIN_ORIGIN)
    .send({ email: "new-admin@example.com" });
  const nonAdmin = await request(setup({ role: UserRole.USER }).app)
    .post("/api/admin/auth/invitations")
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN)
    .send({ email: "new-admin@example.com" });

  assert.equal(unauthenticated.status, 401);
  assert.equal(nonAdmin.status, 403);
});

test("an admin can invite a new admin who signs up and then logs in", async () => {
  const { app, invitations, users } = setup();
  const invited = await request(app)
    .post("/api/admin/auth/invitations")
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN)
    .send({ email: "new-admin@example.com" });

  assert.equal(invited.status, 201);
  assert.equal(invited.body.email, "new-admin@example.com");
  assert.match(invited.body.invitationUrl, /^http:\/\/localhost:5174\/signup#invite=/);
  assert.ok(new Date(invited.body.expiresAt).getTime() - Date.now() > 23 * 60 * 60 * 1000);

  const token = new URL(invited.body.invitationUrl).hash.slice("#invite=".length);
  assert.notEqual(invitations[0].tokenHash, token);
  const signup = await request(app)
    .post("/api/admin/auth/signup")
    .set("Origin", ADMIN_ORIGIN)
    .send({ token, password: "strong-and-unique-admin-password" });

  assert.equal(signup.status, 201);
  assert.equal(signup.body.user.email, "new-admin@example.com");
  assert.equal(signup.body.user.role, "ADMIN");
  assert.ok(invitations[0].usedAt);

  const login = await request(app)
    .post("/api/admin/auth/login")
    .set("Origin", ADMIN_ORIGIN)
    .send({ email: "new-admin@example.com", password: "strong-and-unique-admin-password" });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.role, "ADMIN");
  assert.equal(users.length, 3);

  const reused = await request(app)
    .post("/api/admin/auth/signup")
    .set("Origin", ADMIN_ORIGIN)
    .send({ token, password: "another-unique-admin-password" });
  assert.equal(reused.status, 400);
});

test("rejects invalid credentials and refuses login for a non-admin role", async () => {
  const { app } = setup();
  const invalidPassword = await request(app)
    .post("/api/admin/auth/login")
    .send({ email: "admin@example.com", password: "wrong password" });
  const nonAdmin = await request(app)
    .post("/api/admin/auth/login")
    .send({ email: "member@example.com", password: ADMIN_PASSWORD });

  assert.equal(invalidPassword.status, 401);
  assert.deepEqual(invalidPassword.body, { error: "Invalid email or password" });
  assert.equal(nonAdmin.status, 403);
});

test("rejects missing sessions and database users without the ADMIN role", async () => {
  const { app, calls } = setup();
  const missingSession = await request(app).get("/api/admin/contacts");
  const nonAdminSession = await request(app)
    .get("/api/admin/contacts")
    .set("Cookie", sessionCookie(USER_ID));

  assert.equal(missingSession.status, 401);
  assert.equal(nonAdminSession.status, 403);
  assert.equal(calls.findMany, undefined);
});

test("admins can approve feedback and feature only approved submissions", async () => {
  const { app } = setup();
  const headers = { Cookie: sessionCookie(), Origin: ADMIN_ORIGIN };
  const pendingFeature = await request(app)
    .patch(`/api/admin/feedback/${FEEDBACK_ID}`)
    .set(headers)
    .send({ featured: true });
  const approved = await request(app)
    .patch(`/api/admin/feedback/${FEEDBACK_ID}`)
    .set(headers)
    .send({ status: "APPROVED" });
  const featured = await request(app)
    .patch(`/api/admin/feedback/${FEEDBACK_ID}`)
    .set(headers)
    .send({ featured: true });
  const rejected = await request(app)
    .patch(`/api/admin/feedback/${FEEDBACK_ID}`)
    .set(headers)
    .send({ status: "REJECTED" });

  assert.equal(pendingFeature.status, 400);
  assert.equal(approved.body.status, "APPROVED");
  assert.equal(featured.body.featured, true);
  assert.equal(rejected.body.featured, false);
});

test("feedback moderation requires admin authentication", async () => {
  const { app } = setup();
  const response = await request(app).get("/api/admin/feedback");
  assert.equal(response.status, 401);
});

test("production accepts same-origin fetches without an Origin header", async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    const { app } = setup();
    const response = await request(app)
      .get("/api/admin/auth/me")
      .set("Sec-Fetch-Site", "same-origin");

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: "Authentication required" });
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

test("admins can retrieve a profile picture from Supabase storage", async () => {
  const imageBytes = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  let requestedPath;
  const { app } = setup({
    feedbackImage: { profileImagePath: "feedback-id.jpg", profileImageType: "image/jpeg" },
    profileImageStorage: {
      upload: async () => {},
      download: async (path) => { requestedPath = path; return new Uint8Array(imageBytes); },
      remove: async () => {},
    },
  });

  const response = await request(app)
    .get(`/api/admin/feedback/${FEEDBACK_ID}/profile-picture`)
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN);

  assert.equal(response.status, 200);
  assert.equal(requestedPath, "feedback-id.jpg");
  assert.equal(response.headers["content-type"], "image/jpeg");
  assert.deepEqual(response.body, imageBytes);
});

test("admins can download a PDF containing all feedback submissions", async () => {
  const { app, calls } = setup();
  const response = await request(app)
    .get("/api/admin/feedback/export.pdf")
    .set("Cookie", sessionCookie())
    .buffer(true)
    .parse(parseBufferResponse);

  assert.equal(response.status, 200);
  assert.match(response.headers["content-type"], /application\/pdf/);
  assert.match(response.headers["content-disposition"], /jcc-city-altar-feedback\.pdf/);
  assert.equal(calls.findFeedbackMany.orderBy.createdAt, "desc");
  assert.equal(calls.findFeedbackMany.select.status, true);
  assert.ok(response.body.subarray(0, 5).equals(Buffer.from("%PDF-")));
});

test("lists contacts with pagination, status, and name/email search filters", async () => {
  const { app, calls } = setup();
  const response = await request(app)
    .get("/api/admin/contacts")
    .query({ page: 2, limit: 10, search: "almas@example.com", status: "PENDING" })
    .set("Cookie", sessionCookie());

  assert.equal(response.status, 200);
  assert.deepEqual(calls.findMany, {
    where: {
      status: "PENDING",
      OR: [
        { name: { contains: "almas@example.com", mode: "insensitive" } },
        { email: { contains: "almas@example.com", mode: "insensitive" } },
        { phone: { contains: "almas@example.com", mode: "insensitive" } },
      ],
    },
    skip: 10,
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  assert.equal(response.body.pagination.page, 2);
});

test("admins can download all contact messages as a PDF", async () => {
  const { app, calls } = setup();
  const response = await request(app)
    .get("/api/admin/contacts/export.pdf")
    .set("Cookie", sessionCookie())
    .buffer(true)
    .parse(parseBufferResponse);

  assert.equal(response.status, 200);
  assert.match(response.headers["content-type"], /application\/pdf/);
  assert.match(response.headers["content-disposition"], /jcc-city-altar-contact-messages\.pdf/);
  assert.deepEqual(calls.findMany, {
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
  assert.ok(response.body.subarray(0, 5).equals(Buffer.from("%PDF-")));
});

test("an authenticated admin can send a reply to the original sender", async () => {
  let sentReply;
  const { app } = setup({ sendReply: async (contact, message) => { sentReply = { contact, message }; } });
  const response = await request(app)
    .post(`/api/admin/contacts/${CONTACT_ID}/reply`)
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN)
    .send({ message: "Thanks for getting in touch." });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { sent: true });
  assert.equal(sentReply.contact.email, "avery@example.com");
  assert.equal(sentReply.message, "Thanks for getting in touch.");
});

test("rejects invalid replies and returns 404 for a missing message", async () => {
  const { app } = setup({ sendReply: async () => assert.fail("reply should not be sent") });
  const emptyReply = await request(app)
    .post(`/api/admin/contacts/${CONTACT_ID}/reply`)
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN)
    .send({ message: "  " });
  const missingContact = await request(app)
    .post(`/api/admin/contacts/${USER_ID}/reply`)
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN)
    .send({ message: "Hello" });

  assert.equal(emptyReply.status, 400);
  assert.equal(missingContact.status, 404);
});

test("updates only valid lifecycle statuses and rejects writes from another origin", async () => {
  const { app } = setup();
  const changed = await request(app)
    .patch(`/api/admin/contacts/${CONTACT_ID}`)
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN)
    .send({ status: "IN_PROGRESS" });
  const invalidStatus = await request(app)
    .patch(`/api/admin/contacts/${CONTACT_ID}`)
    .set("Cookie", sessionCookie())
    .send({ status: "UNREAD" });
  const hostileOrigin = await request(app)
    .patch(`/api/admin/contacts/${CONTACT_ID}`)
    .set("Cookie", sessionCookie())
    .set("Origin", "https://attacker.example")
    .send({ status: "RESPONDED" });

  assert.equal(changed.status, 200);
  assert.equal(changed.body.status, "IN_PROGRESS");
  assert.equal(invalidStatus.status, 400);
  assert.equal(hostileOrigin.status, 403);
});

test("returns dashboard lifecycle counts", async () => {
  const { app, calls } = setup();
  const response = await request(app)
    .get("/api/admin/contacts/stats")
    .set("Cookie", sessionCookie());

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    totalRequests: 9,
    pendingCount: 3,
    inProgressCount: 2,
    respondedCount: 4,
    asOf: response.body.asOf,
  });
  assert.equal(calls.count.length, 4);
});

test("deletes an existing contact and returns 404 for an unknown contact", async () => {
  const { app } = setup({ deleteContact: async ({ where }) => {
    if (where.id !== CONTACT_ID) throw Object.assign(new Error("missing"), { code: "P2025" });
    return { id: where.id };
  } });
  const deleted = await request(app)
    .delete(`/api/admin/contacts/${CONTACT_ID}`)
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN);
  const missing = await request(app)
    .delete(`/api/admin/contacts/${USER_ID}`)
    .set("Cookie", sessionCookie())
    .set("Origin", ADMIN_ORIGIN);

  assert.equal(deleted.status, 204);
  assert.equal(missing.status, 404);
});