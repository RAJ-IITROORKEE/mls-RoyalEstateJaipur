// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  lock: vi.fn(),
  find: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
  audit: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: async (
      callback: (transaction: unknown) => Promise<unknown>,
    ) =>
      callback({
        $queryRaw: mocks.lock,
        profile: {
          findUnique: mocks.find,
          count: mocks.count,
          update: mocks.update,
        },
        auditLog: { create: mocks.audit },
      }),
  },
}));
import { updateProfileAccess } from "@/features/admin/users";
beforeEach(() => {
  vi.clearAllMocks();
});
describe("serialized staff access", () => {
  it("rechecks actor status after acquiring the lock", async () => {
    mocks.find.mockResolvedValueOnce({
      role: "SUPER_ADMIN",
      status: "SUSPENDED",
    });
    await expect(
      updateProfileAccess("actor", "target", "USER", "ACTIVE"),
    ).rejects.toThrow("active super admin");
    expect(mocks.lock.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.find.mock.invocationCallOrder[0],
    );
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("preserves the final active super admin", async () => {
    mocks.find
      .mockResolvedValueOnce({ role: "SUPER_ADMIN", status: "ACTIVE" })
      .mockResolvedValueOnce({
        id: "target",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        email: "target@example.test",
      });
    mocks.count.mockResolvedValue(1);
    await expect(
      updateProfileAccess("actor", "target", "USER", "ACTIVE"),
    ).rejects.toThrow("last active super admin");
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });
  it("audits an allowed staff change in the same transaction", async () => {
    mocks.find
      .mockResolvedValueOnce({ role: "SUPER_ADMIN", status: "ACTIVE" })
      .mockResolvedValueOnce({
        id: "target",
        role: "USER",
        status: "ACTIVE",
        email: "target@example.test",
      });
    mocks.update.mockResolvedValue({
      id: "target",
      role: "ADMIN",
      status: "ACTIVE",
    });
    await updateProfileAccess("actor", "target", "ADMIN", "ACTIVE");
    expect(mocks.audit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "PROFILE_ACCESS_CHANGED",
          actorId: "actor",
        }),
      }),
    );
  });
});
