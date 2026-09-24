-- Add manageable public FAQs and active/order controls for search locations.
ALTER TABLE "Locality"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Locality_isActive_sortOrder_name_idx"
ON "Locality"("isActive", "sortOrder", "name");

CREATE TABLE "FaqItem" (
    "id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "question" VARCHAR(240) NOT NULL,
    "answer" VARCHAR(2000) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FaqItem_key_key" ON "FaqItem"("key");
CREATE INDEX "FaqItem_isPublished_sortOrder_createdAt_idx"
ON "FaqItem"("isPublished", "sortOrder", "createdAt");
