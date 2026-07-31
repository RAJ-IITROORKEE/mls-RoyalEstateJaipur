import {
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { getEnvironment } from "@/lib/env";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { getPublicAvatarUrl } from "@/lib/supabase/public-avatar-url";
import { propertyCategories } from "@/features/properties/domain";
import {
  getPublishedProperties,
  type PublicPropertySort,
} from "@/features/properties/queries";
import { formatInrMinorUnits } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function propertyLabel(value: string) {
  return value === "SELL"
    ? "For sale"
    : value === "RESIDENTIAL"
      ? "Residential"
      : value === "PLOT"
        ? "Plot & land"
        : value[0] + value.slice(1).toLowerCase();
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const requestedCategory = first(params.featuredCategory);
  const requestedSort = first(params.featuredSort);
  const category = propertyCategories.includes(
    requestedCategory as (typeof propertyCategories)[number],
  )
    ? (requestedCategory as (typeof propertyCategories)[number])
    : undefined;
  const sort = ["newest", "price_asc", "price_desc"].includes(
    requestedSort ?? "",
  )
    ? (requestedSort as PublicPropertySort)
    : "newest";
  const { NEXT_PUBLIC_BUSINESS_NAME: businessName } = getEnvironment();
  const [access, latestProperties] = await Promise.all([
    getCurrentUserAccess(),
    getPublishedProperties({ category, sort, limit: 6 }),
  ]);
  const user =
    access.mode === "authorized"
      ? {
          displayName: access.profile.displayName,
          email: access.profile.email,
          avatarUrl: getPublicAvatarUrl(access.profile.avatarPath),
        }
      : undefined;
  return (
    <>
      <PublicHeader businessName={businessName} user={user} />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div className="hero-grid absolute inset-0 opacity-60" />
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 pb-18 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <div className="relative z-10">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Property, considered
              </p>
              <h1 className="max-w-2xl font-serif text-5xl leading-[0.94] tracking-tight sm:text-7xl">
                Find a property that fits your{" "}
                <em className="text-primary">next move.</em>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                A calmer way to explore Jaipur real estate, with clear
                information and a team that stays close to the details.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  href="/properties"
                >
                  Explore properties{" "}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center rounded-xl border border-border bg-card px-5 text-sm font-bold transition hover:bg-muted"
                  href="/list-property"
                >
                  List a property
                </Link>
              </div>
            </div>
            <div
              aria-label="Architectural illustration"
              className="architectural-art relative min-h-[370px] overflow-hidden rounded-[2rem] p-5 shadow-2xl sm:min-h-[490px] sm:p-8"
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute bottom-0 left-[9%] h-[71%] w-[31%] border-x border-t border-white/40 bg-white/10" />
              <div className="absolute bottom-0 left-[39%] h-[83%] w-[26%] border-x border-t border-white/50 bg-white/15" />
              <div className="absolute bottom-0 right-[8%] h-[59%] w-[26%] border-x border-t border-white/30 bg-black/10" />
              <div className="absolute left-[13%] top-[18%] h-24 w-28 border border-white/30" />
              <div className="absolute right-8 top-8 max-w-44 rounded-2xl border border-white/30 bg-black/20 p-4 text-white backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  The brief
                </p>
                <p className="mt-2 font-serif text-2xl leading-tight">
                  Space for a slower, better decision.
                </p>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Jaipur / Rajasthan
                </span>
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-full border border-white/40"
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="relative z-10 mx-auto -mt-7 max-w-[1120px] px-5 sm:px-8">
          <form
            action="/properties"
            className="grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center"
          >
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              <label className="cursor-pointer">
                <input
                  className="peer sr-only"
                  defaultChecked
                  name="intent"
                  type="radio"
                  value="SELL"
                />
                <span className="block rounded-lg px-3 py-2 text-xs font-bold text-muted-foreground peer-checked:bg-card peer-checked:text-foreground">
                  Buy
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  className="peer sr-only"
                  name="intent"
                  type="radio"
                  value="RENT"
                />
                <span className="block rounded-lg px-3 py-2 text-xs font-bold text-muted-foreground peer-checked:bg-card peer-checked:text-foreground">
                  Rent
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  className="peer sr-only"
                  name="intent"
                  type="radio"
                  value="LEASE"
                />
                <span className="block rounded-lg px-3 py-2 text-xs font-bold text-muted-foreground peer-checked:bg-card peer-checked:text-foreground">
                  Lease
                </span>
              </label>
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm">
              <MapPin aria-hidden="true" className="size-4 text-primary" />
              <span className="sr-only">Locality or city</span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                name="q"
                placeholder="Locality or city"
              />
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm">
              <Building2 aria-hidden="true" className="size-4 text-primary" />
              <span className="sr-only">Property type</span>
              <select
                className="min-w-0 flex-1 bg-transparent outline-none"
                defaultValue=""
                name="category"
              >
                <option disabled value="">
                  Property type
                </option>
                <option value="PLOT">Plot</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </label>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
              type="submit"
            >
              <Search aria-hidden="true" className="size-4" /> Search
            </button>
          </form>
        </section>
        <section
          className="mx-auto max-w-[1360px] px-5 py-20 sm:px-8 sm:py-28"
          id="latest-properties"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Recently approved
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                Properties ready to explore
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                The latest published properties, with their essential context
                and review-ready imagery.
              </p>
            </div>
            <form
              action="/"
              className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
              method="get"
            >
              <select
                aria-label="Filter recent properties by type"
                className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm"
                defaultValue={category ?? ""}
                name="featuredCategory"
              >
                <option value="">All property types</option>
                {propertyCategories.map((value) => (
                  <option key={value} value={value}>
                    {propertyLabel(value)}
                  </option>
                ))}
              </select>
              <select
                aria-label="Sort recent properties"
                className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm"
                defaultValue={sort}
                name="featuredSort"
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
              <button
                className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
                type="submit"
              >
                Apply
              </button>
            </form>
          </div>
          {!latestProperties.connected ||
          latestProperties.properties.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-8">
              <h3 className="font-serif text-3xl">
                No published properties are available yet.
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Approved listings will appear here after publication.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {latestProperties.properties.map((property) => (
                <article
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40"
                  key={property.slug}
                >
                  <Link className="block" href={`/properties/${property.slug}`}>
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
                          className="architectural-art h-full opacity-80"
                          aria-hidden="true"
                        />
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary backdrop-blur">
                        {propertyLabel(property.intent)}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        {propertyLabel(property.category)}
                      </p>
                      <h3 className="mt-3 font-serif text-3xl leading-tight group-hover:text-primary">
                        {property.title}
                      </h3>
                      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin
                          aria-hidden="true"
                          className="size-4 text-primary"
                        />{" "}
                        {property.localityName}, {property.city}
                      </p>
                      <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
                        <strong className="text-base">
                          {property.priceOnRequest ||
                          property.priceMinor === null
                            ? "Price on request"
                            : formatInrMinorUnits(property.priceMinor)}
                        </strong>
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                          View property{" "}
                          <ArrowUpRight aria-hidden="true" className="size-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
          {latestProperties.hasMore && (
            <div className="mt-10 text-center">
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
                href="/properties"
              >
                See all properties{" "}
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          )}
        </section>
        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                A clear process
              </p>
              <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
                Submit. We review. You connect.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
                Whether you are looking for a place or presenting one, the next
                step should always be obvious.
              </p>
            </div>
            <div className="grid gap-0 sm:grid-cols-3">
              {[
                "Tell us what matters",
                "We review the details",
                "Move the conversation forward",
              ].map((label, index) => (
                <div
                  className="border-l border-border px-5 py-5 first:border-l-0 sm:px-6"
                  key={label}
                >
                  <span className="text-xs font-bold tabular-nums text-accent">
                    0{index + 1}
                  </span>
                  <h3 className="mt-8 text-base font-bold">{label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    A focused step, without unnecessary back and forth.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1360px] gap-8 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-12">
            <ShieldCheck aria-hidden="true" className="size-7 text-accent" />
            <h2 className="mt-12 max-w-lg font-serif text-4xl leading-tight sm:text-5xl">
              Property decisions deserve more context, not more noise.
            </h2>
            <div className="mt-10 grid gap-3 text-sm text-primary-foreground/80">
              <p className="flex items-center gap-3">
                <Check aria-hidden="true" className="size-4 text-accent" />{" "}
                Reviewed listing information
              </p>
              <p className="flex items-center gap-3">
                <Check aria-hidden="true" className="size-4 text-accent" />{" "}
                Direct path to the right conversation
              </p>
              <p className="flex items-center gap-3">
                <Check aria-hidden="true" className="size-4 text-accent" /> No
                promise of availability before confirmation
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-[2rem] border border-border p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              For owners
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight">
              Have a property to present?
            </h2>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Share the essentials and our team will review the submission
              before it goes public.
            </p>
            <Link
              className="mt-10 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold hover:bg-muted"
              href="/list-property"
            >
              Start a submission{" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter businessName={businessName} />
    </>
  );
}
