import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/guards";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}
