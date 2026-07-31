import { redirect } from "next/navigation";

import { requireAdminPage } from "@/lib/auth/guards";

export default async function AdminDashboardAliasPage() {
  await requireAdminPage();
  redirect("/admin");
}
