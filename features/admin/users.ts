import { ProfileRole, ProfileStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function getManageableProfiles(query = "", page = 1) {
  const pageSize = 20;
  const safePage = Math.max(1, page);
  try {
    const where = query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" as const } },
            { displayName: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : undefined;
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (safePage - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarPath: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.profile.count({ where }),
    ]);
    return { connected: true as const, profiles, total, page: safePage, pageSize };
  } catch {
    return {
      connected: false as const,
      profiles: [],
      total: 0,
      page: safePage,
      pageSize,
    };
  }
}

export async function updateProfileAccess(
  actorId: string,
  targetId: string,
  role: ProfileRole,
  status: ProfileStatus,
) {
  return prisma.$transaction(async (transaction) => {
    const actor = await transaction.profile.findUnique({
      where: { id: actorId },
      select: { role: true, status: true },
    });
    if (
      !actor ||
      actor.status !== ProfileStatus.ACTIVE ||
      actor.role !== ProfileRole.SUPER_ADMIN
    )
      throw new Error("Only an active super admin can manage staff.");
    if (actorId === targetId)
      throw new Error("A super admin cannot change their own access.");
    const target = await transaction.profile.findUnique({
      where: { id: targetId },
      select: { id: true, role: true, status: true, email: true },
    });
    if (!target) throw new Error("Profile not found.");
    const removingLastSuperAdmin =
      target.role === ProfileRole.SUPER_ADMIN &&
      target.status === ProfileStatus.ACTIVE &&
      (role !== ProfileRole.SUPER_ADMIN || status !== ProfileStatus.ACTIVE);
    if (removingLastSuperAdmin) {
      const activeSuperAdmins = await transaction.profile.count({
        where: { role: ProfileRole.SUPER_ADMIN, status: ProfileStatus.ACTIVE },
      });
      if (activeSuperAdmins <= 1)
        throw new Error("The last active super admin must be protected.");
    }
    const updated = await transaction.profile.update({
      where: { id: target.id },
      data: { role, status },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "PROFILE_ACCESS_CHANGED",
        entityType: "Profile",
        entityId: target.id,
        summary: `Access changed for ${target.email}`,
        metadata: {
          fromRole: target.role,
          fromStatus: target.status,
          toRole: role,
          toStatus: status,
        },
      },
    });
    return updated;
  });
}
