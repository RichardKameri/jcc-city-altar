CREATE TYPE "ContactSubmissionStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESPONDED');

ALTER TABLE "ContactSubmission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ContactSubmission"
    ALTER COLUMN "status" TYPE "ContactSubmissionStatus_new"
    USING (
        CASE "status"::text
            WHEN 'UNREAD' THEN 'PENDING'
            WHEN 'READ' THEN 'IN_PROGRESS'
            WHEN 'ARCHIVED' THEN 'RESPONDED'
        END
    )::"ContactSubmissionStatus_new";
DROP TYPE "ContactSubmissionStatus";
ALTER TYPE "ContactSubmissionStatus_new" RENAME TO "ContactSubmissionStatus";
ALTER TABLE "ContactSubmission" ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "ContactSubmission_status_createdAt_idx" ON "ContactSubmission"("status", "createdAt");