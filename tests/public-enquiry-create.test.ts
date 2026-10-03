// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const transaction = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  property: { findFirst: vi.fn() },
  enquiry: { findFirst: vi.fn(), create: vi.fn() },
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: async (
      callback: (value: typeof transaction) => Promise<unknown>,
    ) => callback(transaction),
  },
}));
import { createPublicEnquiry } from "@/features/enquiries/create";
const input = {
  contactName: "Test owner",
  email: "OWNER@example.test",
  message: "Please arrange a viewing.",
  consent: "on" as const,
  website: "",
};
beforeEach(() => {
  vi.clearAllMocks();
  transaction.property.findFirst.mockResolvedValue(null);
  transaction.enquiry.findFirst.mockResolvedValue(null);
});

describe("public enquiry deduplication", () => {
  it("locks the exact normalized enquiry before checking and creating", async () => {
    await expect(createPublicEnquiry(input)).resolves.toEqual({
      duplicate: false,
    });
    expect(transaction.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      transaction.enquiry.findFirst.mock.invocationCallOrder[0],
    );
    expect(transaction.enquiry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "owner@example.test",
          type: "GENERAL",
        }),
      }),
    );
  });
  it("returns success without creating an already received enquiry", async () => {
    transaction.enquiry.findFirst.mockResolvedValue({ id: "existing" });
    await expect(createPublicEnquiry(input)).resolves.toEqual({
      duplicate: true,
    });
    expect(transaction.enquiry.create).not.toHaveBeenCalled();
  });
  it("resolves public context only from published properties", async () => {
    await createPublicEnquiry({ ...input, propertyReference: "RE-TEST" });
    expect(transaction.property.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { referenceNumber: "RE-TEST", status: "PUBLISHED" },
      }),
    );
  });
});
