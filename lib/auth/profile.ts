import type { User } from "@supabase/supabase-js";

import { prisma } from "@/lib/db/prisma";

function getDisplayName(user: User) {
  const value = user.user_metadata?.display_name;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function provisionProfile(user: User, updateLastLogin = false) {
  if (!user.email) throw new Error("Authenticated user has no email");

  return prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
      displayName: getDisplayName(user),
      ...(updateLastLogin ? { lastLoginAt: new Date() } : {}),
    },
    update: {
      email: user.email,
      ...(getDisplayName(user) ? { displayName: getDisplayName(user) } : {}),
      ...(updateLastLogin ? { lastLoginAt: new Date() } : {}),
    },
  });
}

export async function updateOwnProfile(
  profileId: string,
  data: { displayName: string; phone: string },
) {
  return prisma.profile.update({
    where: { id: profileId },
    data: {
      displayName: data.displayName.trim() || null,
      phone: data.phone.trim() || null,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      phone: true,
      avatarPath: true,
    },
  });
}
