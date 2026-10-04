// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const identity = vi.hoisted(() => ({ resolve: vi.fn() }));
vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUserAccess: identity.resolve,
}));
import { POST as staff } from "@/app/api/admin/users/route";
import { POST as settings } from "@/app/api/admin/settings/route";
import { POST as faqs } from "@/app/api/admin/faqs/route";
import { POST as localities } from "@/app/api/admin/localities/route";
import { DELETE as deleteLocation } from "@/app/api/admin/localities/[id]/route";
import { POST as blog } from "@/app/api/admin/blog/route";
import { PATCH as property } from "@/app/api/admin/properties/[id]/route";
import { POST as audit } from "@/app/api/admin/audit/route";

beforeEach(() => {
  vi.stubEnv("VERCEL", "0");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe.each(["USER", "REVIEWER"])(
  "direct API access with server role %s",
  (role) => {
    it("rejects forged client staff roles at every administrative content boundary", async () => {
      identity.resolve.mockResolvedValue({
        mode: "authorized",
        profile: { id: "server-owner", role, status: "ACTIVE" },
      });
      const handlers = [staff, settings, faqs, localities, audit];
      // Reviewers can edit the journal under the existing explicit blog policy.
      if (role === "USER") handlers.push(blog);
      for (const handler of handlers) {
        const request = new Request("http://localhost:3000/api/admin/test", {
          method: "POST",
          headers: {
            origin: "http://localhost:3000",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            role: "SUPER_ADMIN",
            actorId: "forged-actor",
          }),
        });
        expect((await handler(request, undefined)).status).toBe(403);
      }
      const request = new Request(
        "http://localhost:3000/api/admin/properties/test",
        {
          method: "PATCH",
          headers: {
            origin: "http://localhost:3000",
            "content-type": "application/json",
          },
          body: "{}",
        },
      );
      expect(
        (
          await property(request, {
            params: Promise.resolve({
              id: "304f94c2-1111-4444-aaaa-a7358b737fd7",
            }),
          })
        ).status,
      ).toBe(403);
      expect(
        (
          await deleteLocation(
            new Request(
              "http://localhost:3000/api/admin/localities/304f94c2-1111-4444-aaaa-a7358b737fd7",
              {
                method: "DELETE",
                headers: {
                  origin: "http://localhost:3000",
                  "content-type": "application/json",
                },
                body: "{}",
              },
            ),
            {
              params: Promise.resolve({
                id: "304f94c2-1111-4444-aaaa-a7358b737fd7",
              }),
            },
          )
        ).status,
      ).toBe(403);
    });
  },
);
