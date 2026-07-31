import { prisma } from "@/lib/db/prisma";

export async function archiveAuditEntry(
  actorId: string,
  auditLogId: string,
  reason: string,
) {
  const cleanReason = reason.trim();
  if (cleanReason.length < 3) throw new Error("Add a reason before archiving.");

  return prisma.$transaction(async (transaction) => {
    const actor = await transaction.profile.findUnique({
      where: { id: actorId },
      select: { role: true, status: true },
    });
    if (actor?.role !== "SUPER_ADMIN" || actor.status !== "ACTIVE")
      throw new Error("Only an active super admin can archive audit entries.");
    const audit = await transaction.auditLog.findUnique({
      where: { id: auditLogId },
      select: { id: true, summary: true, entityType: true, entityId: true },
    });
    if (!audit) throw new Error("Audit entry not found.");
    const archive = await transaction.auditLogArchive.create({
      data: { auditLogId, archivedById: actorId, reason: cleanReason },
      select: { id: true, auditLogId: true, archivedAt: true },
    });
    return archive;
  });
}
