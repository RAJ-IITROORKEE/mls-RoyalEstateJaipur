import { prisma } from "@/lib/db/prisma";
import { hasDatabaseConfiguration, hasSupabaseConfiguration } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserAccess() {
  if (!hasSupabaseConfiguration())
    return { mode: "setup" as const, user: null, profile: null };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { mode: "setup" as const, user: null, profile: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { mode: "unauthenticated" as const, user: null, profile: null };
  if (!hasDatabaseConfiguration())
    return { mode: "database_setup" as const, user, profile: null };
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        avatarPath: true,
        role: true,
        status: true,
      },
    });
    if (profile?.status === "SUSPENDED")
      return { mode: "unauthenticated" as const, user: null, profile: null };
    return profile
      ? { mode: "authorized" as const, user, profile }
      : { mode: "profile_setup" as const, user, profile: null };
  } catch {
    return { mode: "database_setup" as const, user, profile: null };
  }
}
