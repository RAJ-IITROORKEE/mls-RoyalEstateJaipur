import { Archive, Building2, FilePenLine, Globe2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PropertyInventoryActions } from "@/components/admin/property-inventory-actions";
import {
  adminPropertySorts,
  getAdminPropertyInventory,
  type AdminPropertySort,
} from "@/features/admin/properties";
import {
  propertyCategories,
  propertyIntents,
  propertyStatuses,
} from "@/features/properties/domain";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { hasDatabaseConfiguration } from "@/lib/env";
import { canManagePropertyInventory } from "@/lib/permissions/roles";
import { formatDate, formatInrMinorUnits } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pickValue<const T extends readonly string[]>(
  values: T,
  value: string | undefined,
): T[number] | undefined {
  return values.find((item) => item === value);
}

function label(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function pageHref(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  return `/admin/properties?${next.toString()}`;
}

function DistributionChart({
  title,
  groups,
}: {
  title: string;
  groups: Array<{ label: string; count: number }>;
}) {
  const total = groups.reduce((sum, group) => sum + group.count, 0);
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">{title}</h2>
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {total} total
        </span>
      </div>
      <div className="mt-5 space-y-4">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No inventory data yet.
          </p>
        ) : (
          groups.map((group) => {
            const percentage =
              total === 0 ? 0 : Math.round((group.count / total) * 100);
            return (
              <div key={group.label}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs">
                  <span className="font-bold">{label(group.label)}</span>
                  <span className="text-muted-foreground">
                    {group.count} · {percentage}%
                  </span>
                </div>
                <div
                  aria-label={`${label(group.label)}: ${group.count}`}
                  aria-valuemax={total}
                  aria-valuemin={0}
                  aria-valuenow={group.count}
                  className="h-2.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = first(params.query)?.trim() ?? "";
  const status = pickValue(propertyStatuses, first(params.status));
  const intent = pickValue(propertyIntents, first(params.intent));
  const category = pickValue(propertyCategories, first(params.category));
  const sort: AdminPropertySort =
    pickValue(adminPropertySorts, first(params.sort)) ?? "updated_desc";
  const parsedPage = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
  const result = hasDatabaseConfiguration()
    ? await getAdminPropertyInventory({
        query,
        status,
        intent,
        category,
        sort,
        page,
      })
    : await getAdminPropertyInventory();
  const access = await getCurrentUserAccess();
  const canManage =
    access.mode === "authorized" && access.profile
      ? canManagePropertyInventory(access.profile.role)
      : false;
  const preservedParams = new URLSearchParams();
  if (query) preservedParams.set("query", query);
  if (status) preservedParams.set("status", status);
  if (intent) preservedParams.set("intent", intent);
  if (category) preservedParams.set("category", category);
  if (sort !== "updated_desc") preservedParams.set("sort", sort);

  const cards = [
    {
      label: "Total inventory",
      value: result.stats.total,
      icon: Building2,
      copy: "All listing states",
    },
    {
      label: "Published",
      value: result.stats.published,
      icon: Globe2,
      copy: "Visible to visitors",
    },
    {
      label: "Drafts",
      value: result.stats.drafts,
      icon: FilePenLine,
      copy: "Still being prepared",
    },
    {
      label: "Featured",
      value: result.stats.featured,
      icon: Star,
      copy: "Priority placement",
    },
    {
      label: "Archived",
      value: result.stats.archived,
      icon: Archive,
      copy: "Retained off-market",
    },
  ];

  return (
    <section className="space-y-8">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Inventory command
          </p>
          <h1 className="mt-2 font-serif text-4xl">Property management</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Search, audit, edit and move listings through their public
            lifecycle. Archived records remain preserved.
          </p>
        </div>
        <p className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {result.total} matching{" "}
          {result.total === 1 ? "property" : "properties"}
        </p>
      </header>

      {!result.connected ? (
        <div className="rounded-2xl border border-dashed border-border p-8">
          <h2 className="font-serif text-3xl">
            Connect the workspace database.
          </h2>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            href="/admin/settings"
          >
            Open setup notes
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <article
                className="rounded-2xl border border-border bg-card p-5"
                key={card.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {card.label}
                  </p>
                  <card.icon
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                </div>
                <p className="mt-5 font-serif text-4xl">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.copy}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <DistributionChart
              groups={result.stats.byStatus}
              title="Lifecycle status"
            />
            <DistributionChart
              groups={result.stats.byIntent}
              title="Listing intent"
            />
            <DistributionChart
              groups={result.stats.byCategory}
              title="Property types"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4 sm:p-5">
              <form
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(130px,1fr))_auto]"
                method="get"
              >
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Search
                  <input
                    className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground"
                    defaultValue={query}
                    name="query"
                    placeholder="Title, reference, locality or owner"
                  />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Status
                  <select
                    className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground"
                    defaultValue={status ?? ""}
                    name="status"
                  >
                    <option value="">All statuses</option>
                    {propertyStatuses.map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Intent
                  <select
                    className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground"
                    defaultValue={intent ?? ""}
                    name="intent"
                  >
                    <option value="">All intents</option>
                    {propertyIntents.map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Type
                  <select
                    className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground"
                    defaultValue={category ?? ""}
                    name="category"
                  >
                    <option value="">All types</option>
                    {propertyCategories.map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Sort
                  <select
                    className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground"
                    defaultValue={sort}
                    name="sort"
                  >
                    <option value="updated_desc">Recently updated</option>
                    <option value="published_desc">Recently published</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="title_asc">Title A–Z</option>
                  </select>
                </label>
                <div className="flex items-end gap-2">
                  <button
                    className="min-h-11 flex-1 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
                    type="submit"
                  >
                    Apply
                  </button>
                  <Link
                    className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold"
                    href="/admin/properties"
                  >
                    Clear
                  </Link>
                </div>
              </form>
            </div>

            {result.properties.length === 0 ? (
              <div className="p-8 text-center">
                <h2 className="font-serif text-3xl">No properties match.</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Clear a filter or approve a submission to add inventory.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Intent / type</th>
                      <th className="px-4 py-3">Price / area</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Updated</th>
                      {canManage ? (
                        <th className="px-4 py-3 text-right">Actions</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.properties.map((property) => (
                      <tr
                        className="align-middle hover:bg-muted/25"
                        key={property.id}
                      >
                        <td className="px-4 py-4">
                          <div className="flex min-w-64 items-center gap-3">
                            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                              {property.coverImage?.url ? (
                                <Image
                                  alt={property.coverImage.altText}
                                  className="object-cover"
                                  fill
                                  sizes="96px"
                                  src={property.coverImage.url}
                                />
                              ) : (
                                <div className="grid h-full place-items-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">
                                {property.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {property.referenceNumber}
                              </p>
                              {property.isFeatured ? (
                                <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                  Featured
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium">{property.localityName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {property.city}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold">{label(property.intent)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {label(property.category)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold">
                            {property.priceOnRequest ||
                            property.priceMinor === null
                              ? "On request"
                              : formatInrMinorUnits(
                                  BigInt(property.priceMinor),
                                )}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {property.areaValue
                              ? `${property.areaValue} ${property.areaUnit ?? ""}`
                              : "Area not set"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                            {label(property.status)}
                          </span>
                        </td>
                        <td className="max-w-48 px-4 py-4">
                          <p className="truncate font-medium">
                            {property.owner.displayName || "Unnamed owner"}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {property.owner.email}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {formatDate(property.updatedAt)}
                        </td>
                        {canManage ? (
                          <td className="px-4 py-4 text-right">
                            <PropertyInventoryActions
                              isFeatured={property.isFeatured}
                              propertyId={property.id}
                              status={property.status}
                            />
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground">
                Page {result.page} of {result.pageCount} · {result.total}{" "}
                results
              </p>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <Link
                    className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 font-bold"
                    href={pageHref(preservedParams, result.page - 1)}
                  >
                    Previous
                  </Link>
                ) : null}
                {result.page < result.pageCount ? (
                  <Link
                    className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 font-bold"
                    href={pageHref(preservedParams, result.page + 1)}
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
