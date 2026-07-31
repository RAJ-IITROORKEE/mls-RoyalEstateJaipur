import { config } from "dotenv";
import { resolve } from "node:path";

import { createSupabaseAdminClient } from "../lib/supabase/admin";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const requiredBuckets = [
  { id: "property-media", public: true },
  { id: "property-documents", public: false },
  { id: "property-submission-media", public: false },
  { id: "profile-avatars", public: true },
  { id: "blog-draft-media", public: false },
  { id: "blog-media", public: true },
] as const;

async function main() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error(
      "Storage check requires Supabase URL and service-role configuration.",
    );
    process.exit(1);
  }

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Storage bucket check failed.");
    process.exit(1);
  }

  const configured = new Map(
    buckets.map((bucket) => [bucket.id, bucket.public]),
  );
  const missing = requiredBuckets.filter(
    (bucket) => configured.get(bucket.id) !== bucket.public,
  );

  if (missing.length > 0) {
    console.error(
      `Storage configuration incomplete: ${missing.map(({ id }) => id).join(", ")}`,
    );
    process.exit(1);
  }

  console.log("Storage configuration OK. Required buckets and visibility match.");
}

void main();
