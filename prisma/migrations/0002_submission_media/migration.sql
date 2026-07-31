-- Add owner-uploaded preview images without exposing draft storage.
ALTER TABLE "Property" ADD COLUMN "otherPropertyType" TEXT;

CREATE TABLE "PropertySubmissionMedia" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileName" VARCHAR(180) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "altText" VARCHAR(180) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertySubmissionMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PropertySubmissionMedia_storagePath_key" ON "PropertySubmissionMedia"("storagePath");
CREATE INDEX "PropertySubmissionMedia_submissionId_sortOrder_idx" ON "PropertySubmissionMedia"("submissionId", "sortOrder");
ALTER TABLE "PropertySubmissionMedia" ADD CONSTRAINT "PropertySubmissionMedia_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "PropertySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
