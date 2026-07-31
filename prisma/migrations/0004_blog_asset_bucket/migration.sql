-- Track whether each managed blog image is private draft media or published media.
ALTER TABLE "BlogAsset"
ADD COLUMN "bucket" VARCHAR(40) NOT NULL DEFAULT 'blog-draft-media';

ALTER TABLE "BlogAsset"
ADD CONSTRAINT "BlogAsset_bucket_check"
CHECK ("bucket" IN ('blog-draft-media', 'blog-media'));
