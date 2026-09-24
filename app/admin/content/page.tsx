import Link from "next/link";

import { SiteContentManager } from "@/components/admin/site-content-manager";
import { getAdminSiteContent } from "@/features/site-content/queries";
import { requireAdminPage } from "@/lib/auth/guards";
import { canManageSiteContent } from "@/lib/permissions/roles";

export default async function AdminContentPage() {
  const access = await requireAdminPage();
  if (access.mode !== "authorized" || !canManageSiteContent(access.profile.role)) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8">
        <h1 className="font-serif text-3xl">Content management is restricted</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">An active administrator role is required to edit public FAQs and search locations.</p>
        <Link className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold" href="/admin">Return to admin</Link>
      </section>
    );
  }

  const result = await getAdminSiteContent();
  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Site content</p>
        <h1 className="mt-2 font-serif text-4xl">FAQs and locations</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Manage homepage answers and the locations available in property search. Changes are audited.</p>
      </header>
      {!result.connected ? (
        <div className="rounded-2xl border border-dashed border-border p-8">
          <h2 className="font-serif text-3xl">Database connection required</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">The page is showing the bundled public defaults. Connect the database to manage saved content.</p>
          <Link className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground" href="/admin/settings">Open setup notes</Link>
        </div>
      ) : (
        <SiteContentManager faqs={result.faqs} localities={result.localities} />
      )}
    </section>
  );
}
