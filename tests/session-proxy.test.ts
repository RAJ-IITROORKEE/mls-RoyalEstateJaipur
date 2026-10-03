// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ create: vi.fn(), claims: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.create }));
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
  mocks.create.mockReturnValue({ auth: { getClaims: mocks.claims } });
  mocks.claims.mockResolvedValue({ data: null, error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe("Supabase refresh Proxy", () => {
  it("avoids auth calls for anonymous public requests", async () => {
    const response = await refreshSupabaseSession(
      new NextRequest("https://site.test/blogs"),
    );
    expect(mocks.create).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("propagates rotated request cookies, response cookies and provider headers", async () => {
    mocks.create.mockImplementation((_url, _key, options) => {
      mocks.claims.mockImplementation(async () => {
        options.cookies.setAll(
          [
            {
              name: "sb-test-auth-token",
              value: "rotated",
              options: { httpOnly: true, path: "/" },
            },
          ],
          { Pragma: "no-cache" },
        );
        return { data: null, error: null };
      });
      return { auth: { getClaims: mocks.claims } };
    });
    const request = new NextRequest("https://site.test/account", {
      headers: { cookie: "sb-test-auth-token=old" },
    });
    const response = await refreshSupabaseSession(request);
    expect(request.cookies.get("sb-test-auth-token")?.value).toBe("rotated");
    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("rotated");
    expect(response.headers.get("Pragma")).toBe("no-cache");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(mocks.claims).toHaveBeenCalledOnce();
  });

  it("keeps public pages available when refresh fails without caching the session", async () => {
    mocks.claims.mockRejectedValue(new Error("provider unavailable"));
    const response = await refreshSupabaseSession(
      new NextRequest("https://site.test/", {
        headers: { cookie: "sb-test-auth-token=old" },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});
