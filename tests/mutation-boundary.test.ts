// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import {
  getTrustedRequestOrigin,
  isSameOriginMutation,
} from "@/lib/security/request-origin";

afterEach(() => vi.unstubAllEnvs());
const site = "https://example.com";
function request(headers: Record<string, string> = {}, body = "{}") {
  return new Request(`${site}/api/test`, {
    method: "POST",
    body,
    headers: { origin: site, "content-type": "application/json", ...headers },
  });
}
function configure() {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", site);
  vi.stubEnv("VERCEL", "1");
}

describe("request origin", () => {
  it("requires the exact origin, ignoring attacker-controlled forwarded headers", () => {
    configure();
    expect(isSameOriginMutation(request())).toBe(true);
    expect(
      isSameOriginMutation(
        request({
          origin: "https://evil.test",
          "x-forwarded-host": "evil.test",
        }),
      ),
    ).toBe(false);
    expect(isSameOriginMutation(request({ origin: "null" }))).toBe(false);
    expect(
      isSameOriginMutation(request({ "sec-fetch-site": "cross-site" })),
    ).toBe(false);
    const noOrigin = request();
    noOrigin.headers.delete("origin");
    expect(isSameOriginMutation(noOrigin)).toBe(false);
  });
  it("allows only exact deployment aliases and keeps callbacks on their initiating origin", () => {
    configure();
    vi.stubEnv("VERCEL_URL", "preview.vercel.app");
    expect(
      getTrustedRequestOrigin(new Request("https://preview.vercel.app/auth")),
    ).toBe("https://preview.vercel.app");
    expect(
      isSameOriginMutation(
        new Request("https://evil.test/api", {
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toBe(false);
  });
  it("allows local development ports but never loopback on Vercel", () => {
    configure();
    expect(
      isSameOriginMutation(
        new Request("http://localhost:3100/api", {
          headers: { origin: "http://localhost:3100" },
        }),
      ),
    ).toBe(false);
    vi.stubEnv("VERCEL", "0");
    expect(
      isSameOriginMutation(
        new Request("http://localhost:3100/api", {
          headers: { origin: "http://localhost:3100" },
        }),
      ),
    ).toBe(true);
    expect(
      isSameOriginMutation(
        new Request("http://localhost:3100/api", {
          headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100" },
        }),
      ),
    ).toBe(true);
  });
});

describe("mutation boundary", () => {
  it("blocks CSRF before calling auth or domain code", async () => {
    configure();
    const handler = vi.fn(async () => Response.json({ ok: true }));
    const response = await withMutationBoundary(handler)(
      request({ origin: "https://evil.test" }),
      undefined,
    );
    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("rejects malformed JSON and declared or actual oversize bodies", async () => {
    configure();
    const handler = vi.fn(async () => Response.json({ ok: true }));
    const run = withMutationBoundary(handler, { maxBodyBytes: 4 });
    expect((await run(request({}, "{"), undefined)).status).toBe(400);
    expect(
      (await run(request({ "content-length": "10" }), undefined)).status,
    ).toBe(413);
    expect((await run(request({}, "12345"), undefined)).status).toBe(413);
    expect(handler).not.toHaveBeenCalled();
  });
  it("rejects invalid multipart and unsupported content types safely", async () => {
    configure();
    const run = withMutationBoundary(async () => Response.json({ ok: true }));
    expect(
      (await run(request({ "content-type": "multipart/form-data" }), undefined))
        .status,
    ).toBe(400);
    expect(
      (await run(request({ "content-type": "text/plain" }), undefined)).status,
    ).toBe(415);
  });
  it("preserves valid bodies and never leaks internal error details", async () => {
    configure();
    const run = withMutationBoundary(async (req: Request) =>
      Response.json(await req.json()),
    );
    const response = await run(request({}, '{"ok":true}'), undefined);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("x-request-id")).toBeTruthy();
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = await withMutationBoundary(async () => {
      throw new Error("postgres://secret");
    })(request(), undefined);
    expect(failure.status).toBe(500);
    expect(await failure.text()).not.toContain("secret");
    expect(JSON.stringify(logger.mock.calls)).not.toContain("secret");
    logger.mockRestore();
  });
});
