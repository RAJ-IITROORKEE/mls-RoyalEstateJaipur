-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProfileRole" AS ENUM ('USER', 'REVIEWER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PropertyIntent" AS ENUM ('SELL', 'RENT', 'LEASE');

-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('PLOT', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL', 'OTHER');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_CHANGES', 'RESUBMITTED', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'SOLD', 'RENTED', 'LEASED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "EnquiryType" AS ENUM ('GENERAL', 'CALLBACK', 'SITE_VISIT', 'PROPERTY');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST', 'SPAM');

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "displayName" VARCHAR(120),
    "phone" VARCHAR(30),
    "avatarPath" TEXT,
    "role" "ProfileRole" NOT NULL DEFAULT 'USER',
    "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertySubmission" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "referenceNumber" VARCHAR(32) NOT NULL,
    "intent" "PropertyIntent" NOT NULL,
    "category" "PropertyCategory" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "payload" JSONB NOT NULL,
    "assignedReviewerId" UUID,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reason" TEXT,
    "internalNotes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" UUID NOT NULL,
    "sourceSubmissionId" UUID,
    "ownerId" UUID NOT NULL,
    "localityId" UUID,
    "slug" VARCHAR(180) NOT NULL,
    "referenceNumber" VARCHAR(32) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL,
    "intent" "PropertyIntent" NOT NULL,
    "category" "PropertyCategory" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "priceMinor" BIGINT,
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "areaValue" DECIMAL(14,2),
    "areaUnit" VARCHAR(20),
    "areaSqm" DECIMAL(14,2),
    "addressLine" TEXT,
    "localityName" VARCHAR(120) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "state" VARCHAR(80) NOT NULL,
    "postalCode" VARCHAR(12),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "floors" INTEGER,
    "furnishing" VARCHAR(40),
    "possession" VARCHAR(120),
    "amenities" TEXT[],
    "highlights" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredRank" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyMedia" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "storagePath" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "altText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyDocument" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "storagePath" TEXT NOT NULL,
    "documentType" VARCHAR(60) NOT NULL,
    "fileName" VARCHAR(180) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locality" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "state" VARCHAR(80) NOT NULL,
    "summary" TEXT NOT NULL,
    "heroImage" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Locality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" UUID NOT NULL,
    "propertyId" UUID,
    "assignedAdminId" UUID,
    "type" "EnquiryType" NOT NULL DEFAULT 'GENERAL',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "contactName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(30),
    "message" TEXT NOT NULL,
    "preferredContact" VARCHAR(30),
    "requestedVisitDate" TIMESTAMP(3),
    "source" VARCHAR(80),
    "consentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnquiryActivity" (
    "id" UUID NOT NULL,
    "enquiryId" UUID NOT NULL,
    "actorId" UUID,
    "action" VARCHAR(60) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "recipientId" UUID,
    "type" VARCHAR(60) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "body" TEXT NOT NULL,
    "entityType" VARCHAR(60),
    "entityId" UUID,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" VARCHAR(80) NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" UUID,
    "summary" VARCHAR(240) NOT NULL,
    "metadata" JSONB,
    "requestId" VARCHAR(100),
    "ipAddress" VARCHAR(64),
    "userAgent" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Profile_role_status_idx" ON "Profile"("role", "status");

-- CreateIndex
CREATE INDEX "Profile_email_idx" ON "Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PropertySubmission_referenceNumber_key" ON "PropertySubmission"("referenceNumber");

-- CreateIndex
CREATE INDEX "PropertySubmission_ownerId_status_updatedAt_idx" ON "PropertySubmission"("ownerId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "PropertySubmission_status_submittedAt_idx" ON "PropertySubmission"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "PropertySubmission_assignedReviewerId_status_idx" ON "PropertySubmission"("assignedReviewerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Property_sourceSubmissionId_key" ON "Property"("sourceSubmissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Property_referenceNumber_key" ON "Property"("referenceNumber");

-- CreateIndex
CREATE INDEX "Property_status_publishedAt_idx" ON "Property"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Property_intent_category_status_idx" ON "Property"("intent", "category", "status");

-- CreateIndex
CREATE INDEX "Property_city_localityName_status_idx" ON "Property"("city", "localityName", "status");

-- CreateIndex
CREATE INDEX "Property_isFeatured_featuredRank_idx" ON "Property"("isFeatured", "featuredRank");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyMedia_storagePath_key" ON "PropertyMedia"("storagePath");

-- CreateIndex
CREATE INDEX "PropertyMedia_propertyId_sortOrder_idx" ON "PropertyMedia"("propertyId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyDocument_storagePath_key" ON "PropertyDocument"("storagePath");

-- CreateIndex
CREATE INDEX "PropertyDocument_submissionId_idx" ON "PropertyDocument"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Locality_slug_key" ON "Locality"("slug");

-- CreateIndex
CREATE INDEX "Locality_city_isFeatured_idx" ON "Locality"("city", "isFeatured");

-- CreateIndex
CREATE INDEX "Enquiry_status_createdAt_idx" ON "Enquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_assignedAdminId_status_idx" ON "Enquiry"("assignedAdminId", "status");

-- CreateIndex
CREATE INDEX "Enquiry_propertyId_createdAt_idx" ON "Enquiry"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "EnquiryActivity_enquiryId_createdAt_idx" ON "EnquiryActivity"("enquiryId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientId_readAt_createdAt_idx" ON "Notification"("recipientId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE INDEX "SiteSetting_isPublic_key_idx" ON "SiteSetting"("isPublic", "key");

-- AddForeignKey
ALTER TABLE "PropertySubmission" ADD CONSTRAINT "PropertySubmission_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertySubmission" ADD CONSTRAINT "PropertySubmission_assignedReviewerId_fkey" FOREIGN KEY ("assignedReviewerId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_sourceSubmissionId_fkey" FOREIGN KEY ("sourceSubmissionId") REFERENCES "PropertySubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "Locality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMedia" ADD CONSTRAINT "PropertyMedia_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "PropertySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryActivity" ADD CONSTRAINT "EnquiryActivity_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryActivity" ADD CONSTRAINT "EnquiryActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

