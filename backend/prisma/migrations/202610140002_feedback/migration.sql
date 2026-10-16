CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "message" VARCHAR(2000) NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Feedback_status_featured_createdAt_idx"
ON "Feedback"("status", "featured", "createdAt");
