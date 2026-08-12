import { ProfileRole, ProfileStatus } from "@prisma/client";

import { defaultFontFamily } from "@/features/site-appearance/font-family";
import { prisma } from "@/lib/db/prisma";

export const editableSettingKeys = ["business.name", "business.email", "business.phone", "business.whatsapp", "content.demoMode", "appearance.fontFamily"] as const;
export type EditableSettingKey = (typeof editableSettingKeys)[number];

export const siteSettingDefaults = {
  "business.name": { value: "Royal Estates Jaipur", description: "Public business name", isPublic: true },
  "business.email": { value: "hello@example.com", description: "Replace with the configured business email", isPublic: true },
  "business.phone": { value: "+91 00000 00000", description: "Replace with the configured business phone", isPublic: true },
  "business.whatsapp": { value: "910000000000", description: "Digits only WhatsApp destination", isPublic: true },
  "content.demoMode": { value: true, description: "Marks seed content as non-production demo content", isPublic: false },
  "appearance.fontFamily": { value: defaultFontFamily, description: "Controls the body and heading fonts used across public and admin pages.", isPublic: true },
} as const satisfies Record<EditableSettingKey, { value: string | boolean; description: string; isPublic: boolean }>;

export async function getAdminSettings() {
  try {
    const savedSettings = await prisma.siteSetting.findMany({ where: { key: { in: [...editableSettingKeys] } }, select: { key: true, value: true, description: true } });
    const settingsByKey = new Map(savedSettings.map((setting) => [setting.key, setting]));
    const settings = editableSettingKeys.map((key) => settingsByKey.get(key) ?? { key, ...siteSettingDefaults[key] });
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
    const updated = await transaction.siteSetting.upsert({ where: { key }, update: { value: nextValue }, create: { key, value: nextValue, description: siteSettingDefaults[key].description, isPublic: siteSettingDefaults[key].isPublic } });
    await transaction.auditLog.create({ data: { actorId, action: "SITE_SETTING_UPDATED", entityType: "SiteSetting", entityId: updated.id, summary: `Updated ${key}`, metadata: { previousValue: existing?.value ?? null, nextValue } } });
    return updated;
  });
}
