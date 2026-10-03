// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
const database = vi.hoisted(() => ({
  $executeRaw: vi.fn(),
  $queryRaw: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: database }));
import {
  checkRateLimit,
  getRequestIdentifier,
} from "@/lib/security/rate-limit";
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("durable rate limit", () => {
  it("uses an atomic counter in production and stores no raw identifier", async () => {
    vi.stubEnv("NODE_ENV", "production");
    database.$queryRaw.mockResolvedValue([{ count: 3, resetAt: 2000 }]);
    expect(
      await checkRateLimit({
        key: "auth:203.0.113.10",
        limit: 2,
        windowMs: 1000,
      }),
    ).toEqual({ allowed: false, remaining: 0, resetAt: 2000 });
    expect(JSON.stringify(database.$queryRaw.mock.calls)).not.toContain(
      "203.0.113.10",
    );
    expect(database.$executeRaw).toHaveBeenCalledOnce();
  });
  it("fails closed during a production database outage, even with memory fallback configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_BACKEND", "memory");
    database.$executeRaw.mockRejectedValue(new Error("database credential"));
    await expect(
      checkRateLimit({ key: "test", limit: 2, windowMs: 1000 }),
    ).rejects.toThrow("temporarily unavailable");
  });
  it("ignores forwarded identities outside a trusted hosting proxy", () => {
    vi.stubEnv("VERCEL", "0");
    vi.stubEnv("TRUST_PROXY_IP", "false");
    expect(
      getRequestIdentifier(
        new Request("http://localhost", {
          headers: { "x-forwarded-for": "spoofed" },
        }),
      ),
    ).toBe("local");
    vi.stubEnv("VERCEL", "1");
    expect(
      getRequestIdentifier(
        new Request("https://example.com", {
          headers: { "x-forwarded-for": "spoofed" },
        }),
      ),
    ).toBe("unknown");
  });
});
