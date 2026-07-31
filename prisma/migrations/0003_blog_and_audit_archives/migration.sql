-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "PropertySubmissionMedia" ADD COLUMN     "isCover" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AuditLogArchive" (
    "id" UUID NOT NULL,
    "auditLogId" UUID NOT NULL,
    "archivedById" UUID NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLogArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "excerpt" VARCHAR(1000),
    "content" JSONB NOT NULL,
    "readingMinutes" INTEGER NOT NULL DEFAULT 1,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" VARCHAR(200),
    "seoDescription" VARCHAR(320),
    "coverAssetId" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogAsset" (
    "id" UUID NOT NULL,
    "postId" UUID,
    "uploadedById" UUID NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileName" VARCHAR(180) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "altText" VARCHAR(300) NOT NULL,
    "caption" VARCHAR(500),
    "width" INTEGER,
    "height" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditLogArchive_auditLogId_key" ON "AuditLogArchive"("auditLogId");

-- CreateIndex
CREATE INDEX "AuditLogArchive_archivedAt_idx" ON "AuditLogArchive"("archivedAt");

-- CreateIndex
CREATE INDEX "AuditLogArchive_archivedById_archivedAt_idx" ON "AuditLogArchive"("archivedById", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_coverAssetId_key" ON "BlogPost"("coverAssetId");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_updatedAt_idx" ON "BlogPost"("authorId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogAsset_storagePath_key" ON "BlogAsset"("storagePath");

-- CreateIndex
CREATE INDEX "BlogAsset_postId_sortOrder_idx" ON "BlogAsset"("postId", "sortOrder");

-- CreateIndex
CREATE INDEX "BlogAsset_uploadedById_createdAt_idx" ON "BlogAsset"("uploadedById", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditLogArchive" ADD CONSTRAINT "AuditLogArchive_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "AuditLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLogArchive" ADD CONSTRAINT "AuditLogArchive_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "BlogAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogAsset" ADD CONSTRAINT "BlogAsset_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogAsset" ADD CONSTRAINT "BlogAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

