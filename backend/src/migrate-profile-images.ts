import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createProfileImageStorage } from "./profile-image-storage.js";

const prisma = new PrismaClient();
const profileImageStorage = createProfileImageStorage();
const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function migrateLegacyProfileImages() {
  if (!profileImageStorage) {
    throw new Error("Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before migrating profile images");
  }

  const feedbackItems = await prisma.feedback.findMany({
    where: { profileImage: { not: null }, profileImagePath: null },
    select: { id: true, profileImage: true, profileImageType: true },
  });

  for (const feedback of feedbackItems) {
    if (!feedback.profileImage || !feedback.profileImageType) {
      throw new Error(`Feedback ${feedback.id} has incomplete legacy profile image data`);
    }
    const extension = extensionByMimeType[feedback.profileImageType];
    if (!extension) {
      throw new Error(`Feedback ${feedback.id} has unsupported profile image type`);
    }

    const path = `legacy/${feedback.id}.${extension}`;
    await profileImageStorage.upload(path, feedback.profileImage, feedback.profileImageType, true);
    await prisma.feedback.update({
      where: { id: feedback.id },
      data: { profileImagePath: path, profileImage: null },
    });
    console.info(`Migrated profile image for feedback ${feedback.id}`);
  }

  console.info(`Migrated ${feedbackItems.length} profile image(s)`);
}

try {
  await migrateLegacyProfileImages();
} catch (error) {
  console.error("Profile image migration failed", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}