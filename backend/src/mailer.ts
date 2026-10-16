import nodemailer from "nodemailer";
import type { ContactSubmission } from "@prisma/client";

export class SmtpConfigurationError extends Error {
  constructor() {
    super("Email replies are unavailable because SMTP is not configured.");
    this.name = "SmtpConfigurationError";
  }
}

function createTransport() {
  const {
    SMTP_HOST,
    SMTP_PORT = "587",
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_FROM) {
    throw new SmtpConfigurationError();
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

export async function notifyContact(submission: ContactSubmission): Promise<void> {
  const { CONTACT_NOTIFICATION_TO } = process.env;

  if (!CONTACT_NOTIFICATION_TO) {
    console.info("Contact notification mocked; SMTP is not fully configured.");
    return;
  }

  const { from, transport } = createTransport();

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

export async function sendContactReply(submission: ContactSubmission, message: string): Promise<void> {
  const { from, transport } = createTransport();
  const subject = submission.subject.replace(/^re:\s*/i, "");

  await transport.sendMail({
    from,
    to: submission.email,
    subject: `Re: ${subject}`,
    text: `Hello ${submission.name},\n\n${message}`,
  });
}