import sanitizeHtml from "sanitize-html";
import { z } from "zod";

const sanitizeText = (value: string) =>
  sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

export const sanitizedText = (max: number) =>
  z.string()
    .trim()
    .min(1)
    .max(max)
    .transform(sanitizeText)
    .pipe(z.string().min(1).max(max));

export const contactSubmissionSchema = z.object({
  name: sanitizedText(100),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  phone: z.union([
    z.literal(""),
    z.string().trim().max(32).regex(/^\+?[0-9][0-9 ()-]{5,30}$/),
  ]).optional().transform((phone) => phone || null),
  subject: sanitizedText(150),
  message: sanitizedText(5000),
}).strict();