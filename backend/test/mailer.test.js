import assert from "node:assert/strict";
import { test } from "node:test";
import { EmailConfigurationError, sendContactReply } from "../src/mailer.js";

const submission = {
  name: "Avery Example",
  email: "avery@example.com",
  subject: "Sunday service",
};

const gmailEnv = {
  GMAIL_SENDER_EMAIL: "youngrengitonga@gmail.com",
  GMAIL_OAUTH_CLIENT_ID: "client-id",
  GMAIL_OAUTH_CLIENT_SECRET: "client-secret",
  GMAIL_OAUTH_REFRESH_TOKEN: "refresh-token",
};

test("sends admin replies through Gmail API over HTTPS", async () => {
  const requests = [];
  const fetcher = async (url, options) => {
    requests.push({ url, options });
    if (url === "https://oauth2.googleapis.com/token") {
      return new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 });
    }
    return new Response("{}", { status: 200 });
  };

  await sendContactReply(submission, "Thank you for reaching out.", { env: gmailEnv, fetcher });

  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, "https://oauth2.googleapis.com/token");
  assert.equal(requests[1].url, "https://gmail.googleapis.com/gmail/v1/users/me/messages/send");
  assert.equal(requests[1].options.headers.Authorization, "Bearer access-token");
  const rawMessage = JSON.parse(requests[1].options.body).raw;
  const decodedMessage = Buffer.from(rawMessage, "base64url").toString("utf8");
  assert.match(decodedMessage, /From: youngrengitonga@gmail\.com/);
  assert.match(decodedMessage, /To: avery@example\.com/);
  const encodedBody = decodedMessage.split("\r\n\r\n")[1].replaceAll("\r\n", "");
  const decodedBody = Buffer.from(encodedBody, "base64").toString("utf8");
  assert.match(decodedBody, /Hello Avery Example,/);
  assert.match(decodedBody, /Thank you for reaching out\./);
});

test("rejects incomplete Gmail API OAuth configuration", async () => {
  await assert.rejects(
    sendContactReply(submission, "Hello", {
      env: { GMAIL_OAUTH_CLIENT_ID: "client-id" },
      fetcher: async () => new Response("{}", { status: 200 }),
    }),
    EmailConfigurationError,
  );
});