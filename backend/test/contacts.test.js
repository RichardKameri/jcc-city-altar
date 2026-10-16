import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { contactSubmissionSchema } from "../src/contact-validation.js";

const validSubmission = {
  name: "Avery Example",
  email: "avery@example.com",
  phone: "",
  subject: "Service times",
  message: "Could you share the schedule?",
};

function setup({ create = async ({ data }) => ({ id: "submission-id", createdAt: new Date(), ...data }), notify, logger = { error() {} } } = {}) {
  const prisma = {
    contactSubmission: { create },
    feedback: { create: async ({ data }) => ({ id: "feedback-id", createdAt: new Date(), ...data }), findMany: async () => [] },
  };
  const app = createApp({ prisma, notify, logger });
  return { app, create };
}

test("validates and sanitizes contact fields", () => {
  const result = contactSubmissionSchema.safeParse({
    ...validSubmission,
    name: "<b>Avery</b>",
    subject: "<script>alert(1)</script>Schedule",
    email: "AVERY@example.com",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.name, "Avery");
  assert.equal(result.data.subject, "Schedule");
  assert.equal(result.data.email, "avery@example.com");
  assert.equal(result.data.phone, null);
  assert.equal(contactSubmissionSchema.parse({ ...validSubmission, phone: "+1 (555) 123-4567" }).phone, "+1 (555) 123-4567");
});

test("rejects invalid optional phone numbers", () => {
  assert.equal(contactSubmissionSchema.safeParse({ ...validSubmission, phone: "call me" }).success, false);
});

test("stores a valid submission and returns 201", async () => {
  let storedData;
  let notified;
  const { app } = setup({
    create: async ({ data }) => {
      storedData = data;
      return { id: "submission-id", createdAt: new Date("2026-01-01T00:00:00Z"), ...data };
    },
    notify: async (submission) => { notified = submission; },
  });

  const response = await request(app).post("/api/contacts").send(validSubmission);

  assert.equal(response.status, 201);
  assert.equal(response.body.id, "submission-id");
  assert.equal(storedData.status, undefined);
  assert.equal(notified.id, "submission-id");
});

test("rejects invalid data without writing to the database", async () => {
  let createCalled = false;
  const { app } = setup({ create: async () => { createCalled = true; } });

  const response = await request(app).post("/api/contacts").send({ ...validSubmission, email: "bad" });

  assert.equal(response.status, 400);
  assert.equal(createCalled, false);
});

test("limits each client to five submissions per window", async () => {
  const { app } = setup();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request(app).post("/api/contacts").send(validSubmission);
    assert.equal(response.status, 201);
  }

  const limited = await request(app).post("/api/contacts").send(validSubmission);
  assert.equal(limited.status, 429);
});

test("returns a generic 500 when persistence fails", async () => {
  const { app } = setup({ create: async () => { throw new Error("database details"); } });

  const response = await request(app).post("/api/contacts").send(validSubmission);

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, { error: "Internal server error" });
});

test("returns 400 for malformed JSON and 413 for oversized bodies", async () => {
  const { app } = setup();
  const malformed = await request(app)
    .post("/api/contacts")
    .set("Content-Type", "application/json")
    .send("{");
  const oversized = await request(app)
    .post("/api/contacts")
    .send({ ...validSubmission, message: "x".repeat(11000) });

  assert.equal(malformed.status, 400);
  assert.equal(oversized.status, 413);
});