import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { feedbackSubmissionSchema } from "../src/feedback-validation.js";

const validFeedback = {
  name: "Avery Example",
  message: "I have found a welcoming community here.",
};

function setup({
  create = async ({ data }) => ({ id: "feedback-id", createdAt: new Date(), ...data }),
  findMany = async () => [],
  findUnique = async () => null,
} = {}) {
  const prisma = {
    contactSubmission: { create: async ({ data }) => ({ id: "contact-id", ...data }) },
    feedback: { create, findMany, findUnique },
  };
  return createApp({ prisma });
}

test("validates and sanitizes feedback before storing it", () => {
  const parsed = feedbackSubmissionSchema.parse({
    name: "<b>Avery Example</b>",
    message: "<script>bad()</script>I have found a welcoming community here.",
  });
  assert.deepEqual(parsed, {
    name: "Avery Example",
    message: "I have found a welcoming community here.",
  });
  assert.equal(feedbackSubmissionSchema.safeParse({ name: "A", message: "Short" }).success, false);
});

test("public feedback endpoint creates a pending submission", async () => {
  let stored;
  const app = setup({ create: async ({ data }) => { stored = data; return { id: "feedback-id", createdAt: new Date() }; } });

  const response = await request(app).post("/api/feedback").send(validFeedback);

  assert.equal(response.status, 201);
  assert.equal(stored.name, validFeedback.name);
  assert.equal(stored.message, validFeedback.message);
  assert.equal(stored.status, undefined);
  assert.equal(response.body.id, "feedback-id");
});

test("public feedback listing includes only approved featured feedback", async () => {
  let query;
  const app = setup({
    findMany: async (args) => { query = args; return [{ id: "feedback-id", ...validFeedback }]; },
  });

  const response = await request(app).get("/api/feedback");

  assert.equal(response.status, 200);
  assert.deepEqual(query, {
    where: { status: "APPROVED", featured: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, message: true, profileImageType: true, createdAt: true },
  });
  assert.equal(response.body.data.length, 1);
});

test("public feedback submission validates and stores image bytes", async () => {
  const imageBytes = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  let stored;
  const app = setup({
    create: async ({ data }) => { stored = data; return { id: "feedback-id", createdAt: new Date() }; },
  });

  const response = await request(app).post("/api/feedback").send({
    ...validFeedback,
    profileImage: { mimeType: "image/jpeg", data: imageBytes.toString("base64") },
  });

  assert.equal(response.status, 201);
  assert.deepEqual(Buffer.from(stored.profileImage), imageBytes);
  assert.equal(stored.profileImageType, "image/jpeg");
});

test("rejects profile images with mismatched file content", async () => {
  const app = setup();
  const response = await request(app).post("/api/feedback").send({
    ...validFeedback,
    profileImage: { mimeType: "image/png", data: Buffer.from("not an image").toString("base64") },
  });

  assert.equal(response.status, 400);
});

test("serves a profile picture only after feedback approval and featuring", async () => {
  const imageBytes = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  const app = setup({
    findUnique: async () => ({
      status: "APPROVED",
      featured: true,
      profileImage: imageBytes,
      profileImageType: "image/jpeg",
    }),
  });

  const response = await request(app).get("/api/feedback/123e4567-e89b-42d3-a456-426614174003/profile-picture");

  assert.equal(response.status, 200);
  assert.equal(response.headers["content-type"], "image/jpeg");
  assert.deepEqual(response.body, imageBytes);
});
