import { ProfileRole, ProfileStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export const editableSettingKeys = ["business.name", "business.email", "business.phone", "business.whatsapp", "content.demoMode"] as const;
export type EditableSettingKey = (typeof editableSettingKeys)[number];

export async function getAdminSettings() {
  try {
    const settings = await prisma.siteSetting.findMany({ where: { key: { in: [...editableSettingKeys] } }, orderBy: { key: "asc" }, select: { key: true, value: true, description: true, isPublic: true, updatedAt: true } });
    return { connected: true as const, settings };
  } catch {
    return { connected: false as const, settings: [] };
  }
}

export async function updateSiteSetting(actorId: string, key: EditableSettingKey, value: string) {
  return prisma.$transaction(async (transaction) => {
    const actor = await transaction.profile.findUnique({ where: { id: actorId }, select: { role: true, status: true } });
    if (!actor || actor.status !== ProfileStatus.ACTIVE || (actor.role !== ProfileRole.ADMIN && actor.role !== ProfileRole.SUPER_ADMIN)) throw new Error("Only active administrators can update settings.");
    const existing = await transaction.siteSetting.findUnique({ where: { key }, select: { value: true } });
    const nextValue = key === "content.demoMode" ? value === "true" : value;
    const updated = await transaction.siteSetting.upsert({ where: { key }, update: { value: nextValue }, create: { key, value: nextValue, description: null, isPublic: key.startsWith("business.") } });
    await transaction.auditLog.create({ data: { actorId, action: "SITE_SETTING_UPDATED", entityType: "SiteSetting", entityId: updated.id, summary: `Updated ${key}`, metadata: { previousValue: existing?.value ?? null, nextValue } } });
    return updated;
  });
}
