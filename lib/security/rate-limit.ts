import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { prisma } from "@/lib/db/prisma";
import { ServiceUnavailableError } from "@/lib/security/service-unavailable";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

type RateLimitEntry = { count: number; resetAt: number };

const entries = new Map<string, RateLimitEntry>();
const maxEntries = 5_000;

function pruneEntries(now: number) {
  if (entries.size < maxEntries) return;

  for (const [key, entry] of entries) {
    if (entry.resetAt <= now) entries.delete(key);
  }

  while (entries.size >= maxEntries) {
    const oldestKey = entries.keys().next().value;
    if (typeof oldestKey !== "string") break;
    entries.delete(oldestKey);
  }
}

export function getRequestIdentifier(request: Request) {
  // Only trust addresses set by the hosting proxy, not client-supplied headers.
  if (process.env.VERCEL !== "1" && process.env.TRUST_PROXY_IP !== "true")
    return "local";
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwarded && isIP(forwarded) ? forwarded : "unknown";
}

function checkMemoryRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: RateLimitOptions) {
  pruneEntries(now);
  const existing = entries.get(key);
  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    entries.set(key, next);
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (existing.count >= limit)
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export async function checkRateLimit(options: RateLimitOptions) {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.RATE_LIMIT_BACKEND === "memory"
  ) {
    return checkMemoryRateLimit(options);
  }
  if (process.env.NODE_ENV === "test") return checkMemoryRateLimit(options);
  const { limit, windowMs } = options;
  const key = createHash("sha256").update(options.key).digest("hex");
  try {
    // Bounded cleanup keeps stale identifiers out of long-term storage.
    await prisma.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "key" IN (
      SELECT "key" FROM "RateLimitBucket" WHERE "resetAt" <= CURRENT_TIMESTAMP LIMIT 64
    )`;
    const rows = await prisma.$queryRaw<RateLimitEntry[]>`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
      VALUES (${key}, 1, CURRENT_TIMESTAMP + ${windowMs} * interval '1 millisecond')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimitBucket"."resetAt" <= CURRENT_TIMESTAMP THEN 1
          ELSE LEAST("RateLimitBucket"."count" + 1, ${limit + 1}) END,
        "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= CURRENT_TIMESTAMP
          THEN CURRENT_TIMESTAMP + ${windowMs} * interval '1 millisecond'
          ELSE "RateLimitBucket"."resetAt" END
      RETURNING "count", (EXTRACT(EPOCH FROM "resetAt") * 1000)::double precision AS "resetAt"
    `;
    const bucket = rows[0];
    if (!bucket) throw new ServiceUnavailableError();
    return {
      allowed: bucket.count <= limit,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  } catch {
    // Never silently bypass a production limit during a database outage.
    throw new ServiceUnavailableError(
      "The service is temporarily unavailable.",
    );
  }
}

export function clearRateLimitStore() {
  entries.clear();
}
