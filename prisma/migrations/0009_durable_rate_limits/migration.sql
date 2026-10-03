CREATE TABLE "RateLimitBucket" (
  "key" VARCHAR(64) NOT NULL,
  "count" INTEGER NOT NULL,
  "resetAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");
ALTER TABLE "RateLimitBucket" ENABLE ROW LEVEL SECURITY;
-- No user-facing policies: counters are accessible only through the server DB role.
REVOKE ALL ON TABLE "RateLimitBucket" FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "RateLimitBucket" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "RateLimitBucket" FROM authenticated;
  END IF;
END $$;
