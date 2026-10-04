import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  locationFiltersSchema,
  locationTableHref,
} from "@/features/site-content/location-table";
import { getPreviewIllustration } from "@/features/properties/preview-illustrations";

const transaction = vi.hoisted(() => ({
  profile: { findUnique: vi.fn() },
  locality: { findUnique: vi.fn(), delete: vi.fn() },
  property: { count: vi.fn() },
  auditLog: { create: vi.fn() },
  $queryRaw: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  },
}));
import {
  deleteLocality,
  ReferencedLocalityError,
} from "@/features/site-content/mutations";

describe("location table boundaries", () => {
  it("allowlists sorting and bounds pagination and search", () => {
    expect(
      locationFiltersSchema.parse({
        sort: "role",
        page: "Infinity",
        q: "x".repeat(101),
      }),
    ).toEqual({ q: "", sort: "name_asc", page: 1 });
    expect(locationFiltersSchema.parse({ page: "-1" }).page).toBe(1);
    expect(locationFiltersSchema.parse({ page: "2", q: " Jaipur " }).q).toBe(
      "Jaipur",
    );
  });
  it("preserves URL search/sort through pagination", () => {
    const href = locationTableHref(
      { q: "A & B", sort: "name_desc", page: 2 },
      3,
    );
    const url = new URL(href, "https://example.test");
    expect(url.searchParams.get("q")).toBe("A & B");
    expect(url.searchParams.get("sort")).toBe("name_desc");
    expect(url.searchParams.get("page")).toBe("3");
  });
});

describe("audited location deletion", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    transaction.profile.findUnique.mockResolvedValue({
      role: "ADMIN",
      status: "ACTIVE",
    });
    transaction.locality.findUnique.mockResolvedValue({
      id: "location",
      name: "Test area",
      isActive: true,
    });
    transaction.property.count.mockResolvedValue(0);
  });
  it.each([
    { role: "USER", status: "ACTIVE" },
    { role: "REVIEWER", status: "ACTIVE" },
    { role: "ADMIN", status: "SUSPENDED" },
  ])("rejects unauthorized actor %j", async (actor) => {
    transaction.profile.findUnique.mockResolvedValue(actor);
    await expect(deleteLocality("actor", "location")).rejects.toThrow(
      "Active administrator access is required.",
    );
    expect(transaction.$queryRaw).not.toHaveBeenCalled();
    expect(transaction.locality.delete).not.toHaveBeenCalled();
  });
  it("refuses linked locations without deleting or auditing a success", async () => {
    transaction.property.count.mockResolvedValue(1);
    await expect(deleteLocality("actor", "location")).rejects.toBeInstanceOf(
      ReferencedLocalityError,
    );
    expect(transaction.locality.delete).not.toHaveBeenCalled();
    expect(transaction.auditLog.create).not.toHaveBeenCalled();
  });
  it("locks and audits an unreferenced delete in the transaction", async () => {
    await deleteLocality("actor", "location");
    expect(transaction.$queryRaw).toHaveBeenCalledOnce();
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "actor",
        action: "LOCALITY_DELETED",
        entityId: "location",
      }),
    });
    expect(transaction.locality.delete).toHaveBeenCalledWith({
      where: { id: "location" },
    });
    expect(transaction.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      transaction.property.count.mock.invocationCallOrder[0],
    );
  });
  it("rejects missing locations", async () => {
    transaction.locality.findUnique.mockResolvedValue(null);
    await expect(deleteLocality("actor", "location")).rejects.toThrow(
      "Locality not found.",
    );
    expect(transaction.locality.delete).not.toHaveBeenCalled();
  });
});

describe("preview illustration isolation", () => {
  it("only attaches to exact known preview slugs", () => {
    expect(
      getPreviewIllustration("preview-3-bhk-villa-rent-saligrampura"),
    ).toMatchObject({
      isIllustrative: true,
      publicUrl: "/images/illustrations/villa.webp",
    });
    expect(getPreviewIllustration("real-property-with-no-photo")).toBeNull();
    expect(getPreviewIllustration("preview-an-unrelated-property")).toBeNull();
    expect(getPreviewIllustration("toString")).toBeNull();
  });
});
