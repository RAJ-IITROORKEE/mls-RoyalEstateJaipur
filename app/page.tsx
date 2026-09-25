import {
  ArrowUpRight,
  BookOpenText,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HomeFaqSection } from "@/components/home/home-faq-section";
import { HomeHeroBackground } from "@/components/home/home-hero-background";
import { HomeLocalitySection } from "@/components/home/home-locality-section";
import { HomePropertySearch } from "@/components/home/home-property-search";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { PropertyCardAction } from "@/components/properties/property-card-action";
import { getPublishedBlogPosts } from "@/features/blog/service";
import {
  publicPropertyIntents,
  propertyCategories,
} from "@/features/properties/domain";
import {
  getPublishedProperties,
  type PublicPropertySort,
} from "@/features/properties/queries";
import {
  getPublicFaqItems,
  getPublicLocalities,
} from "@/features/site-content/queries";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { getEnvironment } from "@/lib/env";
import { getPublicAvatarUrl } from "@/lib/supabase/public-avatar-url";
import { formatInrMinorUnits } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function propertyLabel(value: string) {
  if (value === "SELL") return "Buy";
  if (value === "RENT") return "Rent";
  if (value === "PLOT") return "Plot & land";
  return value[0] + value.slice(1).toLowerCase();
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
  const [access, latestProperties, localityResult, faqResult, journalResult] =
    await Promise.all([
      getCurrentUserAccess(),
      getPublishedProperties({ category, sort, limit: 6 }),
      getPublicLocalities(),
      getPublicFaqItems(),
      getPublishedBlogPosts(),
    ]);
  const user =
    access.mode === "authorized"
      ? {
          displayName: access.profile.displayName,
          email: access.profile.email,
          avatarUrl: getPublicAvatarUrl(access.profile.avatarPath),
        }
      : undefined;
  const requestedIntent = first(params.intent);
  const initialIntent = publicPropertyIntents.includes(
    requestedIntent as (typeof publicPropertyIntents)[number],
  )
    ? requestedIntent
    : "SELL";
  const initialLocality = first(params.locality) ?? "";
  const initialSearch = first(params.q) ?? "";
  const initialPropertyType = first(params.category) ?? "";

  return (
    <>
      <PublicHeader businessName={businessName} user={user} />
      <main className="flex-1">
        <section className="home-hero relative isolate overflow-hidden border-b border-border bg-card">
          <HomeHeroBackground />
          <div className="relative z-10 mx-auto max-w-[1360px] px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mx-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-semibold text-muted-foreground">
                <MapPin aria-hidden="true" className="size-3.5 text-primary" />
                Property search across Jaipur
              </p>
              <h1 className="hero-title-reveal mx-auto mt-6 max-w-4xl text-balance font-sans text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Find your next{" "}
                <span className="text-primary">property in Jaipur</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Compare homes, plots, and commercial spaces for sale or rent,
                then contact the team to confirm the details.
              </p>
            </div>
            <HomePropertySearch
              initialCategory={initialPropertyType}
              initialIntent={initialIntent}
              initialLocality={initialLocality}
              initialQuery={initialSearch}
              localities={localityResult.localities}
            />
          </div>
        </section>

        <section
          className="mx-auto max-w-[1360px] px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24"
          id="latest-properties"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                The latest listings
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                A closer look at what is available
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Review the property details and contact the team to confirm
                current availability.
              </p>
            </div>
            <form
              action="/"
              className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
              method="get"
            >
              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
                Property type
                <select
                  className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
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
              </label>
              <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
                Sort listings
                <select
                  className="min-h-11 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground"
                  defaultValue={sort}
                  name="featuredSort"
                >
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </label>
              <button
                className="min-h-11 self-end rounded-xl border border-border px-4 text-sm font-bold transition-colors hover:bg-muted"
                type="submit"
              >
                Apply
              </button>
            </form>
          </div>

          {!latestProperties.connected ? (
            <div className="mt-9 rounded-2xl border border-dashed border-border p-7 sm:p-9">
              <h3 className="font-serif text-3xl">
                Listings are temporarily unavailable.
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Please try again shortly, or use the search form to return when
                the catalogue is available.
              </p>
            </div>
          ) : latestProperties.properties.length === 0 ? (
            <div className="mt-9 rounded-2xl border border-dashed border-border p-7 sm:p-9">
              <h3 className="font-serif text-3xl">
                No published properties match this view yet.
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Try another property type or browse the full catalogue.
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
                href="/properties"
              >
                Browse all properties
              </Link>
            </div>
          ) : (
            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {latestProperties.properties.map((property) => (
                <article
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 motion-reduce:transform-none motion-reduce:transition-none"
                  key={property.slug}
                >
                  <Link
                    className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    href={"/properties/" + property.slug}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {property.coverImage?.publicUrl ? (
                        <Image
                          alt={property.coverImage.altText}
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
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
                      <span className="absolute right-4 top-4 inline-flex min-h-9 items-center rounded-full border border-primary-foreground/30 bg-primary px-4 text-xs font-extrabold uppercase tracking-[0.14em] text-primary-foreground ring-2 ring-background">
                        {propertyLabel(property.intent)}
                      </span>
                    </div>
                    <div className="p-5 sm:p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        {propertyLabel(property.category)}
                      </p>
                      <h3 className="mt-3 font-serif text-2xl leading-tight group-hover:text-primary sm:text-3xl">
                        {property.title}
                      </h3>
                      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin
                          aria-hidden="true"
                          className="size-4 shrink-0 text-primary"
                        />
                        {property.localityName}, {property.city}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                        {property.areaValue && (
                          <span className="rounded-lg bg-muted px-2.5 py-1.5">
                            {property.areaValue} {property.areaUnit}
                          </span>
                        )}
                        <span className="rounded-lg bg-muted px-2.5 py-1.5">
                          {property.priceOnRequest ||
                          property.priceMinor === null
                            ? "Price on request"
                            : formatInrMinorUnits(property.priceMinor)}
                        </span>
                      </div>
                      <PropertyCardAction />
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
          {latestProperties.connected && latestProperties.totalCount > 6 && (
            <div className="mt-9 text-center">
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover hover:text-primary-hover-foreground"
                href="/properties"
              >
                View all {latestProperties.totalCount} properties
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          )}
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                A considered process
              </p>
              <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
                Clear details. A useful next step.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                Browse what is published, ask about the details, and decide
                whether you want to take the conversation further.
              </p>
            </div>
            <div className="grid gap-0 sm:grid-cols-3">
              {[
                ["01", "Explore", "Compare the property facts that matter to you."],
                ["02", "Ask", "Send an enquiry with your preferred contact details."],
                ["03", "Visit", "Arrange a site visit after the team confirms availability."],
              ].map(([number, title, description]) => (
                <article
                  className="border-l border-border px-5 py-4 first:border-l-0 sm:px-6"
                  key={number}
                >
                  <span className="text-xs font-bold tabular-nums text-accent">
                    {number}
                  </span>
                  <h3 className="mt-7 text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <HomeLocalitySection localities={localityResult.localities} />
        {journalResult.connected && journalResult.posts.length > 0 && (
          <section
            aria-labelledby="home-journal-title"
            className="border-y border-border bg-card"
          >
            <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-20">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    <BookOpenText aria-hidden="true" className="size-4" />
                    The journal
                  </p>
                  <h2
                    className="mt-3 font-serif text-4xl leading-tight sm:text-5xl"
                    id="home-journal-title"
                  >
                    A little more clarity for
                    <span className="text-primary"> your next move.</span>
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    Straightforward guides for comparing homes and planning a visit.
                  </p>
                </div>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover hover:text-primary-hover-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:self-auto"
                  href="/blogs"
                >
                  Explore all articles
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {journalResult.posts.slice(0, 2).map((post, index) => (
                  <article
                    className={`journal-card group rounded-2xl border transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/50 ${index === 0 ? "journal-card--featured border-primary/35 bg-spotlight text-spotlight-foreground" : "border-border bg-background text-foreground"}`}
                    key={post.id}
                  >
                    <Link
                      aria-label={`Read article: ${post.title}`}
                      className="flex h-full flex-col rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:p-7"
                      href={`/blogs/${post.slug}`}
                    >
                      <div
                        className={`flex items-center justify-between gap-4 border-b pb-4 ${index === 0 ? "border-spotlight-foreground/20" : "border-border"}`}
                      >
                        <span
                          className={`inline-flex min-h-9 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${index === 0 ? "text-accent" : "text-primary"}`}
                        >
                          {index === 0 ? (
                            <BookOpenText aria-hidden="true" className="size-4" />
                          ) : (
                            <span className="font-sans text-lg tabular-nums tracking-normal">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          )}
                          {index === 0 ? "Featured guide" : "Property guide"}
                        </span>
                        <span
                          className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${index === 0 ? "border-spotlight-foreground/25 text-spotlight-foreground/80" : "border-border text-muted-foreground"}`}
                        >
                          <Clock3 aria-hidden="true" className="size-3.5" />
                          {post.readingMinutes} min read
                        </span>
                      </div>
                      <h3
                        className={`mt-5 font-serif text-2xl leading-snug sm:text-3xl ${index === 0 ? "text-spotlight-foreground group-hover:text-accent" : "text-foreground group-hover:text-primary"}`}
                      >
                        {post.title}
                      </h3>
                      <p
                        className={`mt-3 flex-1 text-sm leading-7 ${index === 0 ? "text-spotlight-foreground/75" : "text-muted-foreground"}`}
                      >
                        {post.excerpt || "Practical notes for your property search."}
                      </p>
                      <span className="mt-7 inline-flex min-h-11 items-center justify-between gap-3 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors group-hover:bg-primary-hover group-hover:text-primary-hover-foreground">
                        Read the guide
                        <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
        <HomeFaqSection faqs={faqResult.faqs} />

        <section className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="grid gap-6 rounded-[2rem] bg-spotlight p-7 text-spotlight-foreground ring-1 ring-border sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
            <div className="max-w-2xl">
              <ShieldCheck
                aria-hidden="true"
                className="size-7 text-accent"
              />
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                For buyers, renters, and owners
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                Start with the property. Take the next step when you are ready.
              </h2>
              <div className="mt-6 grid gap-2 text-sm text-spotlight-foreground/85 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <Check aria-hidden="true" className="size-4 text-accent" />
                  Published listings only
                </p>
                <p className="flex items-center gap-2">
                  <Check aria-hidden="true" className="size-4 text-accent" />
                  Enquiry does not reserve a property
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-accent-foreground transition-[filter] hover:brightness-95"
                href="/contact"
              >
                Talk to the team
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center rounded-xl border border-spotlight-foreground/40 px-5 text-sm font-bold transition-colors hover:bg-spotlight-foreground/10"
                href="/about"
              >
                About us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter businessName={businessName} />
    </>
  );
}
