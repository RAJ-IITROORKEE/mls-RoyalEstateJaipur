import { redirect } from "next/navigation";

import { hasSupabaseConfiguration } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminAccess() {
  if (!hasSupabaseConfiguration()) return { mode: "setup" as const, profile: null };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { mode: "setup" as const, profile: null };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { mode: "unauthenticated" as const, profile: null };
  let profile;
  try {
    profile = await prisma.profile.findUnique({ where: { id: user.id }, select: { displayName: true, email: true, role: true, status: true } });
  } catch {
    return { mode: "forbidden" as const, profile: null };
  }
  if (!profile || profile.status !== "ACTIVE" || profile.role === "USER") return { mode: "forbidden" as const, profile: null };
  return { mode: "authorized" as const, profile };
}

export async function requireAdminPage() {
  const access = await getAdminAccess();
  if (access.mode === "setup" && process.env.NODE_ENV !== "development") redirect("/sign-in?error=The%20admin%20workspace%20is%20not%20configured.");
  if (access.mode === "unauthenticated") redirect("/sign-in?redirect=%2Fadmin");
  if (access.mode === "forbidden") {
    redirect("/sign-in?redirect=%2Fadmin&error=This%20account%20does%20not%20have%20admin%20access.");
  }
  return access;
}
