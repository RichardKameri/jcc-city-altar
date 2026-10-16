import { z } from "zod";
import { sanitizedText } from "./contact-validation.js";

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_PROFILE_IMAGE_BASE64_LENGTH = Math.ceil(MAX_PROFILE_IMAGE_BYTES / 3) * 4;

export const feedbackSubmissionSchema = z.object({
  name: sanitizedText(80).pipe(z.string().min(2).max(80)),
  message: sanitizedText(2000).pipe(z.string().min(10).max(2000)),
  profileImage: z.object({
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    data: z.string()
      .min(1)
      .max(MAX_PROFILE_IMAGE_BASE64_LENGTH)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
  }).strict().optional(),
}).strict();

export function decodeProfileImage(image: { mimeType: string; data: string }): Uint8Array<ArrayBuffer> | null {
  const bytes = Buffer.from(image.data, "base64");
  const canonicalBase64 = bytes.toString("base64");
  if (canonicalBase64 !== image.data || bytes.length > MAX_PROFILE_IMAGE_BYTES) return null;

  const isJpeg = image.mimeType === "image/jpeg" &&
    bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = image.mimeType === "image/png" &&
    bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = image.mimeType === "image/webp" &&
    bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";

  return isJpeg || isPng || isWebp ? new Uint8Array(bytes) : null;
}
