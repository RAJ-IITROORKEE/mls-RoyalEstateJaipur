import { expect, test } from "@playwright/test";

test("API mutations reject missing and hostile origins before authentication", async ({
  request,
  baseURL,
}) => {
  const endpoints = [
    "/api/auth/sign-in",
    "/api/auth/sign-out",
    "/api/auth/sign-up",
    "/api/enquiries",
    "/api/admin/users",
    "/api/admin/blog",
    "/api/admin/faqs",
    "/api/submissions",
  ];
  for (const endpoint of endpoints) {
    const missing = await request.post(endpoint, { data: {} });
    expect(missing.status(), endpoint).toBe(403);
    const hostile = await request.post(endpoint, {
      headers: {
        origin: "https://evil.example",
        "x-forwarded-host": "evil.example",
      },
      data: {},
    });
    expect(hostile.status(), endpoint).toBe(403);
    expect(hostile.headers()["cache-control"]).toContain("no-store");
  }
  const unauthenticated = await request.post("/api/admin/users", {
    headers: { origin: new URL(baseURL ?? "http://127.0.0.1:3100").origin },
    data: { role: "SUPER_ADMIN", profileId: "forged-owner" },
  });
  expect(unauthenticated.status()).toBe(401);
});

test("malformed and oversized API requests have safe responses", async ({
  request,
  baseURL,
}) => {
  const origin = new URL(baseURL ?? "http://127.0.0.1:3100").origin;
  const malformed = await request.post("/api/admin/users", {
    headers: { origin, "content-type": "application/json" },
    data: Buffer.from("{"),
  });
  expect(malformed.status()).toBe(400);
  expect(await malformed.text()).not.toContain("SyntaxError");
  const oversized = await request.post("/api/admin/users", {
    headers: { origin, "content-type": "application/json" },
    data: JSON.stringify({ value: "a".repeat(300 * 1024) }),
  });
  expect(oversized.status()).toBe(413);
  expect(oversized.headers()["x-request-id"]).toBeTruthy();
});
