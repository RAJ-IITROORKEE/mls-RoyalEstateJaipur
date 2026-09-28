import { ArrowUpRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PublicPage } from "@/components/layout/public-page";
import { PropertyCard } from "@/components/properties/property-card";
import {
  publicPropertyIntents,
  propertyCategories,
} from "@/features/properties/domain";
import {
  getPublishedProperties,
  type PublicPropertySort,
} from "@/features/properties/queries";
import { getPublicLocalities } from "@/features/site-content/queries";

export const metadata: Metadata = {
  title: "Properties in Jaipur",
  description: "Search published homes, plots, and commercial properties for sale or rent across Jaipur.",
  alternates: { canonical: "/properties" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function label(value: string) {
  if (value === "SELL") return "Buy";
  if (value === "RENT") return "Rent";
  if (value === "PLOT") return "Plot & land";
  return value[0] + value.slice(1).toLowerCase();
}

function integerParam(value: string | undefined) {
  return value && /^\d+$/.test(value) ? value : undefined;
}

function decimalParam(value: string | undefined) {
  return value && /^\d+(\.\d{1,2})?$/.test(value) ? value : undefined;
}

function shortTextParam(value: string | undefined, maximum: number) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length <= maximum ? trimmed : undefined;
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
  const intentParam = first(params.intent);
  const categoryParam = first(params.category);
  const query = shortTextParam(first(params.q), 120);
  const locality = shortTextParam(first(params.locality), 100);
  const minPrice = integerParam(first(params.minPrice));
  const maxPrice = integerParam(first(params.maxPrice));
  const minArea = decimalParam(first(params.minArea));
  const maxArea = decimalParam(first(params.maxArea));
  const bedrooms = integerParam(first(params.bedrooms));
  const furnishing = shortTextParam(first(params.furnishing), 40);
  const amenity = shortTextParam(first(params.amenity), 80);
  const requestedSort = first(params.sort);
  const sort = ["newest", "price_asc", "price_desc"].includes(
    requestedSort ?? "",
  )
    ? (requestedSort as PublicPropertySort)
    : "newest";
  const requestedPage = Number(first(params.page));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const validIntent = publicPropertyIntents.includes(
    intentParam as (typeof publicPropertyIntents)[number],
  )
    ? (intentParam as (typeof publicPropertyIntents)[number])
    : undefined;
  const validCategory = propertyCategories.includes(
    categoryParam as (typeof propertyCategories)[number],
  )
    ? (categoryParam as (typeof propertyCategories)[number])
    : undefined;

  const [result, localityResult] = await Promise.all([
    getPublishedProperties({
      intent: validIntent,
      category: validCategory,
      query,
      locality,
      minPriceMinor: rupeesToPaise(minPrice),
      maxPriceMinor: rupeesToPaise(maxPrice),
      minArea,
      maxArea,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      furnishing,
      amenity,
      page,
      sort,
    }),
    getPublicLocalities(),
  ]);

  const pageQuery = new URLSearchParams();
  if (query) pageQuery.set("q", query);
  if (locality) pageQuery.set("locality", locality);
  if (validIntent) pageQuery.set("intent", validIntent);
  if (validCategory) pageQuery.set("category", validCategory);
  if (minPrice) pageQuery.set("minPrice", minPrice);
  if (maxPrice) pageQuery.set("maxPrice", maxPrice);
  if (minArea) pageQuery.set("minArea", minArea);
  if (maxArea) pageQuery.set("maxArea", maxArea);
  if (bedrooms) pageQuery.set("bedrooms", bedrooms);
  if (furnishing) pageQuery.set("furnishing", furnishing);
  if (amenity) pageQuery.set("amenity", amenity);
  if (sort !== "newest") pageQuery.set("sort", sort);
  const queryString = pageQuery.toString();
  const previousHref =
    "/properties" +
    (queryString
      ? "?" + queryString + "&page=" + String(page - 1)
      : "?page=" + String(page - 1));
  const nextHref =
    "/properties" +
    (queryString
      ? "?" + queryString + "&page=" + String(page + 1)
      : "?page=" + String(page + 1));

  return (
    <PublicPage>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                The property catalogue
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                Properties in Jaipur
              </h1>
            </div>
            <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
              {result.connected
                ? result.totalCount + (result.totalCount === 1 ? " property" : " properties") + " found"
                : "Catalogue temporarily unavailable"}
            </p>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Search published listings by title, area, locality, or property
            type. Confirm current availability with the team.
          </p>

          <form
            action="/properties"
            className="mt-8 rounded-2xl border border-border bg-background p-4 sm:p-5"
            method="get"
            role="search"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_0.8fr_auto] lg:items-end">
              <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-muted-foreground">
                Search by title, area, locality
                <input
                  className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={query}
                  name="q"
                  placeholder="e.g. 3 BHK, Jagatpura"
                  type="search"
                />
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-muted-foreground">
                Location
                <select
                  className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={locality ?? ""}
                  name="locality"
                >
                  <option value="">All Locations</option>
                  {localityResult.localities.map((item) => (
                    <option key={item.slug} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-muted-foreground">
                Property type
                <select
                  className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={validCategory ?? ""}
                  name="category"
                >
                  <option value="">All property types</option>
                  {propertyCategories.map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-muted-foreground">
                I am looking to
                <select
                  className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={validIntent ?? ""}
                  name="intent"
                >
                  <option value="">Buy or rent</option>
                  {publicPropertyIntents.map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover hover:text-primary-hover-foreground"
                type="submit"
              >
                <Search aria-hidden="true" className="size-4" />
                Search
              </button>
            </div>

            <details className="group mt-4 border-t border-border pt-3">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                More filters
              </summary>
              <div className="grid gap-3 pb-2 pt-2 sm:grid-cols-2 lg:grid-cols-4">
                <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                  Minimum price (₹)
                  <input
                    className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
                    defaultValue={minPrice}
                    inputMode="numeric"
                    min="0"
                    name="minPrice"
                    type="number"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                  Maximum price (₹)
                  <input
                    className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
                    defaultValue={maxPrice}
                    inputMode="numeric"
                    min="0"
                    name="maxPrice"
                    type="number"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                  Minimum area
                  <input
                    className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
                    defaultValue={minArea}
                    inputMode="decimal"
                    min="0"
                    name="minArea"
                    type="number"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                  Maximum area
                  <input
                    className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
                    defaultValue={maxArea}
                    inputMode="decimal"
                    min="0"
                    name="maxArea"
                    type="number"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                  Bedrooms
                  <select
                    className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
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
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                  Furnishing
                  <select
                    className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
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
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                  Amenity
                  <input
                    className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
                    defaultValue={amenity}
                    name="amenity"
                    placeholder="e.g. parking"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                  Sort properties
                  <select
                    className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
                    defaultValue={sort}
                    name="sort"
                  >
                    <option value="newest">Newest first</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
                  type="submit"
                >
                  Apply filters
                </button>
                <Link
                  className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  href="/properties"
                >
                  Clear all
                </Link>
              </div>
            </details>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 sm:py-16">
        {!result.connected ? (
          <div className="rounded-2xl border border-dashed border-border p-8 sm:p-10" role="status">
            <h2 className="font-serif text-3xl">The catalogue is temporarily unavailable.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Please try again shortly. Your filters are still in the address
              bar, so you can return to this search later.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
              href={"/properties" + (queryString ? "?" + queryString : "")}
            >
              Try again
            </Link>
          </div>
        ) : result.properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              No matching properties
            </p>
            <h2 className="mt-3 font-serif text-3xl">
              Try another location or broaden your search.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Clear a filter or return to the full catalogue to see all
              published listings.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
              href="/properties"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min((page - 1) * 24 + 1, result.totalCount)}–
                {Math.min(page * 24, result.totalCount)} of {result.totalCount}
              </p>
              {localityResult.connected ? null : (
                <p className="text-xs text-muted-foreground" role="status">
                  Using the default location list while updates are unavailable.
                </p>
              )}
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {result.properties.map((property) => (
                <PropertyCard
                  key={property.slug}
                  property={property}
                  showReference
                />
              ))}
            </div>
            <nav
              aria-label="Property pages"
              className="mt-10 flex justify-between gap-4"
            >
              {page > 1 ? (
                <Link
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold hover:bg-muted"
                  href={previousHref}
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              {result.hasMore && (
                <Link
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
                  href={nextHref}
                >
                  Next page
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              )}
            </nav>
          </>
        )}
      </section>
    </PublicPage>
  );
}
