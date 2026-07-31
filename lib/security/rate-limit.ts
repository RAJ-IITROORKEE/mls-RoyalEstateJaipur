type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

type RateLimitEntry = { count: number; resetAt: number };

const entries = new Map<string, RateLimitEntry>();

export function getRequestIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit({ key, limit, windowMs, now = Date.now() }: RateLimitOptions) {
  const existing = entries.get(key);
  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    entries.set(key, next);
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (existing.count >= limit) return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function clearRateLimitStore() {
  entries.clear();
}
