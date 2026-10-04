import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  configured: vi.fn(() => true),
  localities: vi.fn(),
  faqs: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    locality: { findMany: mocks.localities },
    faqItem: { findMany: mocks.faqs },
  },
}));
vi.mock("@/lib/env", () => ({ hasDatabaseConfiguration: mocks.configured }));
import {
  getPublicFaqItems,
  getPublicLocalities,
} from "@/features/site-content/queries";

describe("saved public content", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.configured.mockReturnValue(true);
  });
  it("keeps intentionally empty saved FAQ and location lists empty", async () => {
    mocks.localities.mockResolvedValue([]);
    mocks.faqs.mockResolvedValue([]);
    expect(await getPublicLocalities()).toEqual({
      connected: true,
      localities: [],
    });
    expect(await getPublicFaqItems()).toEqual({ connected: true, faqs: [] });
  });
  it("retains a safe bundled fallback when the database is unavailable", async () => {
    mocks.localities.mockRejectedValue(new Error("unavailable"));
    mocks.faqs.mockRejectedValue(new Error("unavailable"));
    const [locations, faqs] = await Promise.all([
      getPublicLocalities(),
      getPublicFaqItems(),
    ]);
    expect(locations.connected).toBe(false);
    expect(faqs.connected).toBe(false);
    expect(locations.localities.length).toBeGreaterThan(0);
    expect(faqs.faqs.length).toBeGreaterThan(0);
  });
});
