import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PropertyEditor } from "@/components/admin/property-editor";
import { PropertyInventoryActions } from "@/components/admin/property-inventory-actions";
import { PropertyMediaManager } from "@/components/admin/property-media-manager";
import { getAdminProperty } from "@/features/admin/properties";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { canManagePropertyInventory } from "@/lib/permissions/roles";

export default async function AdminPropertyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile)
    redirect("/sign-in?redirect=%2Fadmin%2Fproperties");
  if (!canManagePropertyInventory(access.profile.role))
    redirect("/admin/properties");
  const property = await getAdminProperty((await params).id);
  if (!property) notFound();

  return (
    <section className="space-y-8">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <Link
            className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-primary"
            href="/admin/properties"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to inventory
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {property.referenceNumber}
          </p>
          <h1 className="mt-2 font-serif text-4xl">Edit property</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Owned by {property.owner.displayName || property.owner.email}. Every
            save and lifecycle change is audited.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {property.status === "PUBLISHED" ? (
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold"
              href={`/properties/${property.slug}`}
              target="_blank"
            >
              View public page
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
          <PropertyInventoryActions
            isFeatured={property.isFeatured}
            propertyId={property.id}
            status={property.status}
          />
        </div>
      </header>

      <PropertyEditor property={property} />

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">Public gallery</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage banner selection, image descriptions and public listing media.
        </p>
        <PropertyMediaManager media={property.media} propertyId={property.id} />
      </section>
    </section>
  );
}
