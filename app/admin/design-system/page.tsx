import type { Metadata } from "next";

import { DesignSystemPreview } from "@/components/admin/design-system-preview";
import { requireAdminPage } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Design system preview",
  robots: { index: false, follow: false },
};

export default async function DesignSystemPage() {
  await requireAdminPage();
  return <DesignSystemPreview />;
}
