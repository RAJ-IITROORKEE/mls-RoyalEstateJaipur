import { prisma } from "@/lib/db/prisma";
import { hasDatabaseConfiguration } from "@/lib/env";

export type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  createdAt: Date;
  actor: { displayName: string | null; email: string } | null;
  archive: { archivedAt: Date; reason: string } | null;
};

export async function getAuditEntries(): Promise<{
  connected: boolean;
  entries: AuditEntry[];
}> {
  if (!hasDatabaseConfiguration()) return { connected: false, entries: [] };
  try {
    const entries = await prisma.auditLog.findMany({
      where: { archive: null },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        summary: true,
        createdAt: true,
        actor: { select: { displayName: true, email: true } },
        archive: { select: { archivedAt: true, reason: true } },
      },
    });
    return { connected: true, entries };
  } catch {
    return { connected: false, entries: [] };
  }
}
