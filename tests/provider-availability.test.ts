import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getGoogleProviderStatus } from "@/features/auth/provider-availability";

describe("getGoogleProviderStatus", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports an explicitly disabled Google provider", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ external: { google: false } }), {
        status: 200,
      }),
    );

    await expect(getGoogleProviderStatus()).resolves.toBe("disabled");
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/auth/v1/settings", "https://example.supabase.co"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("does not misreport unknown or unreachable status as disabled", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    fetchMock.mockRejectedValueOnce(new Error("Network unavailable"));

    await expect(getGoogleProviderStatus()).resolves.toBe("unknown");
    await expect(getGoogleProviderStatus()).resolves.toBe("unknown");
  });

  it("reports an enabled provider", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ external: { google: true } }), {
        status: 200,
      }),
    );

    await expect(getGoogleProviderStatus()).resolves.toBe("enabled");
  });
});
