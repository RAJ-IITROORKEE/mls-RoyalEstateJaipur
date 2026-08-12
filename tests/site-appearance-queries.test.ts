import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirst } = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(callback: T) => callback,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    siteSetting: { findFirst },
  },
}));

import { getPublicFontFamily } from "@/features/site-appearance/queries";

describe("getPublicFontFamily", () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it("falls back for a database error without retaining that fallback", async () => {
    findFirst
      .mockRejectedValueOnce(new Error("Database unavailable"))
      .mockResolvedValueOnce({ value: "dm-serif" });

    await expect(getPublicFontFamily()).resolves.toBe("current");
    await expect(getPublicFontFamily()).resolves.toBe("dm-serif");
  });
});
