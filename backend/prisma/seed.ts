import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { z } from "zod";

const envSchema = z.object({
  ADMIN_EMAIL: z.string().email().max(254).transform((email) => email.toLowerCase()),
  ADMIN_PASSWORD: z.string().min(14).max(128),
});

const env = envSchema.parse(process.env);
const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: { passwordHash, role: UserRole.ADMIN },
    create: { email: env.ADMIN_EMAIL, passwordHash, role: UserRole.ADMIN },
  });
  console.info(`Administrator account ready for ${env.ADMIN_EMAIL}`);
} finally {
  await prisma.$disconnect();
}