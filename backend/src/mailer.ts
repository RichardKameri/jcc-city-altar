import nodemailer from "nodemailer";
import type { ContactSubmission } from "@prisma/client";

export class EmailConfigurationError extends Error {
  constructor(message = "Email replies are unavailable because email is not configured.") {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

function createTransport(env: NodeJS.ProcessEnv) {
  const {
    SMTP_HOST,
    SMTP_PORT = "587",
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
  } = env;

  if (!SMTP_HOST || !SMTP_FROM) {
    throw new EmailConfigurationError("Email replies are unavailable because SMTP is not configured.");
  }
  if (SMTP_USER && !SMTP_PASSWORD) {
    throw new EmailConfigurationError("Email replies are unavailable because SMTP authentication is not configured.");
  }

  return {
    from: SMTP_FROM,
    transport: nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      disableFileAccess: true,
      disableUrlAccess: true,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    }),
  };
}

type GmailMessage = {
  from: string;
  to: string;
  subject: string;
  text: string;
};

function encodeGmailMessage(message: GmailMessage): string {
  const safeHeader = (value: string) => value.replace(/[\r\n]+/g, " ").trim();
  const subject = `=?UTF-8?B?${Buffer.from(safeHeader(message.subject), "utf8").toString("base64")}?=`;
  const body = Buffer.from(message.text, "utf8").toString("base64").replace(/.{1,76}/g, "$&\r\n");
  const rawMessage = [
    `From: ${safeHeader(message.from)}`,
    `To: ${safeHeader(message.to)}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(rawMessage, "utf8").toString("base64url");
}

async function sendWithGmailApi(
  message: GmailMessage,
  env: NodeJS.ProcessEnv,
  fetcher: typeof fetch,
): Promise<void> {
  const clientId = env.GMAIL_OAUTH_CLIENT_ID;
  const clientSecret = env.GMAIL_OAUTH_CLIENT_SECRET;
  const refreshToken = env.GMAIL_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new EmailConfigurationError("Gmail API OAuth is only partially configured.");
  }

  const tokenResponse = await fetcher("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!tokenResponse.ok) {
    throw new Error(`Gmail OAuth token request failed with status ${tokenResponse.status}`);
  }

  const tokenPayload = await tokenResponse.json() as { access_token?: string };
  if (!tokenPayload.access_token) {
    throw new Error("Gmail OAuth token response did not contain an access token");
  }

  const sendResponse = await fetcher("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodeGmailMessage(message) }),
  });
  if (!sendResponse.ok) {
    throw new Error(`Gmail API send request failed with status ${sendResponse.status}`);
  }
}

export async function notifyContact(submission: ContactSubmission): Promise<void> {
  const { CONTACT_NOTIFICATION_TO } = process.env;

  if (!CONTACT_NOTIFICATION_TO) {
    console.info("Contact notification mocked; SMTP is not fully configured.");
    return;
  }

  const { from, transport } = createTransport(process.env);

  await transport.sendMail({
    from,
    to: CONTACT_NOTIFICATION_TO,
    replyTo: submission.email,
    subject: `Contact form: ${submission.subject}`,
    text: [
      `From: ${submission.name} <${submission.email}>${submission.phone ? ` (${submission.phone})` : ""}`,
      `Subject: ${submission.subject}`,
      "",
      submission.message,
    ].join("\n"),
  });
}

export async function sendContactReply(
  submission: ContactSubmission,
  message: string,
  dependencies: { env?: NodeJS.ProcessEnv; fetcher?: typeof fetch } = {},
): Promise<void> {
  const env = dependencies.env ?? process.env;
  const fetcher = dependencies.fetcher ?? globalThis.fetch;
  const subject = submission.subject.replace(/^re:\s*/i, "");
  const gmailApiConfigured = Boolean(
    env.GMAIL_OAUTH_CLIENT_ID || env.GMAIL_OAUTH_CLIENT_SECRET || env.GMAIL_OAUTH_REFRESH_TOKEN,
  );

  if (gmailApiConfigured) {
    if (!env.GMAIL_SENDER_EMAIL) {
      throw new EmailConfigurationError("GMAIL_SENDER_EMAIL must be configured for Gmail API replies.");
    }
    await sendWithGmailApi({
      from: env.GMAIL_SENDER_EMAIL,
      to: submission.email,
      subject: `Re: ${subject}`,
      text: `Hello ${submission.name},\n\n${message}`,
    }, env, fetcher);
    return;
  }

  const { from, transport } = createTransport(env);

  await transport.sendMail({
    from,
    to: submission.email,
    subject: `Re: ${subject}`,
    text: `Hello ${submission.name},\n\n${message}`,
  });
}