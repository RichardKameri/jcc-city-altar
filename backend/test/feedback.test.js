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
  profileImageStorage,
} = {}) {
  const prisma = {
    contactSubmission: { create: async ({ data }) => ({ id: "contact-id", ...data }) },
    feedback: { create, findMany, findUnique },
  };
  return createApp({ prisma, profileImageStorage });
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

test("public feedback submission stores profile images in external storage", async () => {
  const imageBytes = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  let stored;
  let uploaded;
  const app = setup({
    create: async ({ data }) => { stored = data; return { id: "feedback-id", createdAt: new Date() }; },
    profileImageStorage: {
      upload: async (path, bytes, contentType) => { uploaded = { path, bytes, contentType }; },
      download: async () => new Uint8Array(),
      remove: async () => {},
    },
  });

  const response = await request(app).post("/api/feedback").send({
    ...validFeedback,
    profileImage: { mimeType: "image/jpeg", data: imageBytes.toString("base64") },
  });

  assert.equal(response.status, 201);
  assert.match(stored.profileImagePath, /^[0-9a-f-]+\.jpg$/);
  assert.equal(stored.profileImage, undefined);
  assert.equal(stored.profileImageType, "image/jpeg");
  assert.equal(uploaded.path, stored.profileImagePath);
  assert.deepEqual(Buffer.from(uploaded.bytes), imageBytes);
  assert.equal(uploaded.contentType, "image/jpeg");
});

test("accepts profile images larger than 2 MB within the upload limit", async () => {
  const imageBytes = Buffer.alloc(3 * 1024 * 1024);
  imageBytes.set([0xff, 0xd8, 0xff]);
  let uploadedSize = 0;
  const app = setup({
    profileImageStorage: {
      upload: async (_path, bytes) => { uploadedSize = bytes.byteLength; },
      download: async () => new Uint8Array(),
      remove: async () => {},
    },
  });

  const response = await request(app).post("/api/feedback").send({
    ...validFeedback,
    profileImage: { mimeType: "image/jpeg", data: imageBytes.toString("base64") },
  });

  assert.equal(response.status, 201);
  assert.equal(uploadedSize, imageBytes.length);
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

test("serves Supabase-stored profile pictures only after approval and featuring", async () => {
  const imageBytes = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  let requestedPath;
  const app = setup({
    findUnique: async () => ({
      status: "APPROVED",
      featured: true,
      profileImage: null,
      profileImagePath: "feedback-id.jpg",
      profileImageType: "image/jpeg",
    }),
    profileImageStorage: {
      upload: async () => {},
      download: async (path) => { requestedPath = path; return new Uint8Array(imageBytes); },
      remove: async () => {},
    },
  });

  const response = await request(app).get("/api/feedback/123e4567-e89b-42d3-a456-426614174003/profile-picture");

  assert.equal(response.status, 200);
  assert.equal(requestedPath, "feedback-id.jpg");
  assert.equal(response.headers["content-type"], "image/jpeg");
  assert.deepEqual(response.body, imageBytes);
});
