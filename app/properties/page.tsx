import { Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PublicPage } from "@/components/layout/public-page";
import {
  propertyCategories,
  propertyIntents,
} from "@/features/properties/domain";
import { getPublishedProperties } from "@/features/properties/queries";
import type { PublicPropertySort } from "@/features/properties/queries";
import { getEnvironment } from "@/lib/env";
import { formatInrMinorUnits } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function label(value: string) {
  return value === "SELL" ? "Buy" : value[0] + value.slice(1).toLowerCase();
}

function integerParam(value: string | undefined) {
  return value && /^\d+$/.test(value) ? value : undefined;
}

function decimalParam(value: string | undefined) {
  return value && /^\d+(\.\d{1,2})?$/.test(value) ? value : undefined;
}

function rupeesToPaise(value: string | undefined) {
  const rupees = integerParam(value);
  return rupees ? (BigInt(rupees) * BigInt(100)).toString() : undefined;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const intent = first(params.intent);
  const category = first(params.category);
  const query = first(params.q)?.trim();
  const minPrice = integerParam(first(params.minPrice));
  const maxPrice = integerParam(first(params.maxPrice));
  const minArea = decimalParam(first(params.minArea));
  const maxArea = decimalParam(first(params.maxArea));
  const bedrooms = integerParam(first(params.bedrooms));
  const furnishing = first(params.furnishing)?.trim();
  const amenity = first(params.amenity)?.trim();
  const requestedSort = first(params.sort);
  const sort = ["newest", "price_asc", "price_desc"].includes(
    requestedSort ?? "",
  )
    ? (requestedSort as PublicPropertySort)
    : "newest";
  const requestedPage = Number(first(params.page));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const result = await getPublishedProperties({
    intent: propertyIntents.includes(intent as (typeof propertyIntents)[number])
      ? (intent as (typeof propertyIntents)[number])
      : undefined,
    category: propertyCategories.includes(
      category as (typeof propertyCategories)[number],
    )
      ? (category as (typeof propertyCategories)[number])
      : undefined,
    query: query || undefined,
    minPriceMinor: rupeesToPaise(minPrice),
    maxPriceMinor: rupeesToPaise(maxPrice),
    minArea,
    maxArea,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    furnishing: furnishing || undefined,
    amenity: amenity || undefined,
    page,
    sort,
  });
  const { NEXT_PUBLIC_BUSINESS_NAME: businessName } = getEnvironment();
  const pageQuery = new URLSearchParams();
  if (query) pageQuery.set("q", query);
  if (intent) pageQuery.set("intent", intent);
  if (category) pageQuery.set("category", category);
  if (minPrice) pageQuery.set("minPrice", minPrice);
  if (maxPrice) pageQuery.set("maxPrice", maxPrice);
  if (minArea) pageQuery.set("minArea", minArea);
  if (maxArea) pageQuery.set("maxArea", maxArea);
  if (bedrooms) pageQuery.set("bedrooms", bedrooms);
  if (furnishing) pageQuery.set("furnishing", furnishing);
  if (amenity) pageQuery.set("amenity", amenity);
  if (sort !== "newest") pageQuery.set("sort", sort);
  const queryString = pageQuery.toString();
  const previousHref = `/properties${queryString ? `?${queryString}&page=${page - 1}` : `?page=${page - 1}`}`;
  const nextHref = `/properties${queryString ? `?${queryString}&page=${page + 1}` : `?page=${page + 1}`}`;

  return (
    <PublicPage>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            The catalogue
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] sm:text-7xl">
            Properties with the useful details in view.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            Browse published listings by intent, type, and locality.
            Availability is confirmed directly with the team.
          </p>
          <form
            className="mt-10 grid gap-3 rounded-2xl border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-5"
            method="get"
          >
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-border px-3 text-sm">
              <Search aria-hidden="true" className="size-4 text-primary" />
              <span className="sr-only">Search locality</span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                defaultValue={query}
                name="q"
                placeholder="Search locality or city"
              />
            </label>
            <select
              aria-label="Intent"
              className="min-h-12 rounded-xl border border-border bg-background px-3 text-sm"
              defaultValue={intent ?? ""}
              name="intent"
            >
              <option value="">Any intent</option>
              {propertyIntents.map((value) => (
                <option key={value} value={value}>
                  {label(value)}
                </option>
              ))}
            </select>
            <select
              aria-label="Property type"
              className="min-h-12 rounded-xl border border-border bg-background px-3 text-sm"
              defaultValue={category ?? ""}
              name="category"
            >
              <option value="">Any type</option>
              {propertyCategories.map((value) => (
                <option key={value} value={value}>
                  {label(value)}
                </option>
              ))}
            </select>
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-border px-3 text-sm">
              <span className="sr-only">Minimum price in rupees</span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                defaultValue={minPrice}
                inputMode="numeric"
                min="0"
                name="minPrice"
                placeholder="Min price (₹)"
                type="number"
              />
            </label>
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-border px-3 text-sm">
              <span className="sr-only">Maximum price in rupees</span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                defaultValue={maxPrice}
                inputMode="numeric"
                min="0"
                name="maxPrice"
                placeholder="Max price (₹)"
                type="number"
              />
            </label>
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-border px-3 text-sm">
              <span className="sr-only">Minimum area</span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                defaultValue={minArea}
                inputMode="decimal"
                min="0"
                name="minArea"
                placeholder="Min area"
                type="number"
              />
            </label>
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-border px-3 text-sm">
              <span className="sr-only">Maximum area</span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                defaultValue={maxArea}
                inputMode="decimal"
                min="0"
                name="maxArea"
                placeholder="Max area"
                type="number"
              />
            </label>
            <select
              aria-label="Minimum bedrooms"
              className="min-h-12 rounded-xl border border-border bg-background px-3 text-sm"
              defaultValue={bedrooms ?? ""}
              name="bedrooms"
            >
              <option value="">Any bedrooms</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}+ bedrooms
                </option>
              ))}
            </select>
            <select
              aria-label="Furnishing"
              className="min-h-12 rounded-xl border border-border bg-background px-3 text-sm"
              defaultValue={furnishing ?? ""}
              name="furnishing"
            >
              <option value="">Any furnishing</option>
              {["Furnished", "Semi-furnished", "Unfurnished"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <input
              aria-label="Amenity"
              className="min-h-12 rounded-xl border border-border bg-background px-3 text-sm"
              defaultValue={amenity}
              name="amenity"
              placeholder="Amenity"
            />
            <select
              aria-label="Sort properties"
              className="min-h-12 rounded-xl border border-border bg-background px-3 text-sm"
              defaultValue={sort}
              name="sort"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
              type="submit"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" /> Search
            </button>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-5 text-sm font-bold"
              href="/properties"
            >
              Clear
            </Link>
          </form>
        </div>
      </section>
      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              {result.connected
                ? `${result.properties.length}${result.hasMore ? "+" : ""} published ${result.properties.length === 1 ? "listing" : "listings"}`
                : "Catalogue setup"}
            </p>
            <h2 className="mt-2 font-serif text-4xl">
              A considered shortlist.
            </h2>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">
            {businessName}
          </span>
        </div>
        {!result.connected ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8">
            <h3 className="font-serif text-3xl">
              Listings will appear here after database setup.
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              No sample inventory is presented as real. Connect Supabase
              Postgres, run the checked-in Prisma migration, and publish
              approved properties from the admin workspace.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
              href="/contact"
            >
              Talk to the team
            </Link>
          </div>
        ) : result.properties.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8">
            <h3 className="font-serif text-3xl">
              No published properties match this search.
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Try another locality or clear the filters. Published availability
              is intentionally separate from private submissions.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {result.properties.map((property) => (
                <Link
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/40"
                  href={`/properties/${property.slug}`}
                  key={property.slug}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {property.coverImage?.publicUrl ? (
                      <Image
                        alt={property.coverImage.altText}
                        className="object-cover transition duration-300 group-hover:scale-[1.025]"
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        src={property.coverImage.publicUrl}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="architectural-art h-full opacity-80"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                        {label(property.intent)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {property.referenceNumber}
                      </span>
                    </div>
                    <h3 className="mt-8 font-serif text-3xl leading-tight group-hover:text-primary">
                      {property.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {property.localityName}, {property.city}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                      <span className="rounded-lg bg-muted px-2.5 py-1">
                        {label(property.category)}
                      </span>
                      {property.areaValue && (
                        <span className="rounded-lg bg-muted px-2.5 py-1">
                          {property.areaValue} {property.areaUnit}
                        </span>
                      )}
                      {property.priceOnRequest ? (
                        <span className="rounded-lg bg-muted px-2.5 py-1">
                          Price on request
                        </span>
                      ) : (
                        property.priceMinor !== null && (
                          <span className="rounded-lg bg-muted px-2.5 py-1">
                            {formatInrMinorUnits(property.priceMinor)}
                          </span>
                        )
                      )}
                    </div>
                    <span className="mt-6 inline-flex items-center text-sm font-bold text-primary">
                      View full property
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <nav
              aria-label="Property pages"
              className="mt-10 flex justify-between gap-4"
            >
              {page > 1 ? (
                <Link
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold"
                  href={previousHref}
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              {result.hasMore && (
                <Link
                  className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
                  href={nextHref}
                >
                  Next page
                </Link>
              )}
            </nav>
          </>
        )}
      </section>
    </PublicPage>
  );
}
