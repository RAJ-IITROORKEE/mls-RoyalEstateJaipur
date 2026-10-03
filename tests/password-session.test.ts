// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  provision: vi.fn(),
  limit: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { signInWithPassword: mocks.signIn, signOut: mocks.signOut },
  }),
}));
vi.mock("@/lib/auth/profile", () => ({ provisionProfile: mocks.provision }));
vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: mocks.limit,
  getRequestIdentifier: () => "test",
}));
import { POST } from "@/app/api/auth/sign-in/route";

function credentials(redirect = "/account/submissions") {
  return new Request("http://localhost:3000/api/auth/sign-in", {
    method: "POST",
    headers: { origin: "http://localhost:3000" },
    body: new URLSearchParams({
      email: "owner@example.test",
      password: "test-password",
      redirect,
    }),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
  vi.stubEnv("DATABASE_URL", "configured");
  vi.stubEnv("VERCEL", "0");
  mocks.limit.mockResolvedValue({ allowed: true });
  mocks.signIn.mockResolvedValue({
    data: { user: { id: "test-id" } },
    error: null,
  });
});
afterEach(() => vi.unstubAllEnvs());
describe("password session activation", () => {
  it("signs out suspended profiles before returning an error", async () => {
    mocks.provision.mockResolvedValue({
      role: "SUPER_ADMIN",
      status: "SUSPENDED",
    });
    const response = await POST(credentials(), undefined);
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toContain(
      "does+not+have+workspace+access",
    );
  });
  it("clears a new session if profile provisioning fails", async () => {
    mocks.provision.mockRejectedValue(new Error("database secret"));
    const response = await POST(credentials(), undefined);
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toContain(
      "workspace+is+unavailable",
    );
    expect(response.headers.get("location")).not.toContain("secret");
  });
  it("uses server roles and rejects a hostile redirect", async () => {
    mocks.provision.mockResolvedValue({ role: "USER", status: "ACTIVE" });
    const response = await POST(credentials("//evil.test"), undefined);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/account/submissions",
    );
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
  it("does not start a session when the database is unconfigured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    await POST(credentials(), undefined);
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
});
