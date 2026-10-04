import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/guards";
import { getPublicAvatarUrl } from "@/lib/supabase/public-avatar-url";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await requireAdminPage();
  const user =
    access.mode === "authorized"
      ? {
          name: access.profile.displayName || "Your account",
          role: access.profile.role.replaceAll("_", " ").toLowerCase(),
          avatarUrl: getPublicAvatarUrl(access.profile.avatarPath),
        }
      : null;
  return <AdminShell user={user}>{children}</AdminShell>;
}
