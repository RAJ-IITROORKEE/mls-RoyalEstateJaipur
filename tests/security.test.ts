import { afterEach, describe, expect, it } from "vitest";

import { clearRateLimitStore, checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { getPublicPropertyMediaUrl } from "@/lib/supabase/public-url";
import { getPublicBlogMediaUrl } from "@/lib/supabase/blog-url";

afterEach(() => {
  clearRateLimitStore();
});

describe("rate limiting", () => {
  it("allows up to the configured limit and resets after the window", () => {
    expect(checkRateLimit({ key: "test", limit: 2, windowMs: 1000, now: 100 }).allowed).toBe(true);
    expect(checkRateLimit({ key: "test", limit: 2, windowMs: 1000, now: 200 }).remaining).toBe(0);
    expect(checkRateLimit({ key: "test", limit: 2, windowMs: 1000, now: 300 }).allowed).toBe(false);
    expect(checkRateLimit({ key: "test", limit: 2, windowMs: 1000, now: 1100 }).allowed).toBe(true);
  });

  it("uses the first forwarded address as the request identity", () => {
    const request = new Request("https://example.com", { headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1", "x-real-ip": "192.0.2.1" } });
    expect(getRequestIdentifier(request)).toBe("203.0.113.10");
  });
});

describe("public media URLs", () => {
  it("encodes each storage path segment", () => {
    const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    expect(getPublicPropertyMediaUrl("owner/submission/front view.jpg")).toBe("https://example.supabase.co/storage/v1/object/public/property-media/owner/submission/front%20view.jpg");
    expect(getPublicBlogMediaUrl("post/cover image.webp")).toBe("https://example.supabase.co/storage/v1/object/public/blog-media/post/cover%20image.webp");
    process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
  });
});
