import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PublicPage } from "@/components/layout/public-page";
import { propertyCategories } from "@/features/properties/domain";
import { getPublicLocalities } from "@/features/site-content/queries";

export const metadata: Metadata = {
  title: "About Royal Estates Jaipur",
  description:
    "Learn how Royal Estates Jaipur organizes property listings by type and location, and find a useful place to begin your search.",
  alternates: { canonical: "/about" },
};

const categoryLabels: Record<(typeof propertyCategories)[number], string> = {
  PLOT: "Plots and land",
  RESIDENTIAL: "Homes and residential property",
  COMMERCIAL: "Commercial property",
  INDUSTRIAL: "Industrial property",
  AGRICULTURAL: "Agricultural land",
  OTHER: "Other property types",
};

export default async function AboutPage() {
  const localityResult = await getPublicLocalities();
  const featuredLocalities = localityResult.localities.filter(
    (locality) => locality.isFeatured,
  );
  const areasToShow = (
    featuredLocalities.length ? featuredLocalities : localityResult.localities
  ).slice(0, 10);

  return (
    <PublicPage>
      <section className="overflow-hidden border-b border-border bg-card">
        <div className="mx-auto max-w-[1360px] px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span>About us</span>
          </nav>
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <p className="text-sm font-semibold text-primary">
              About Royal Estates Jaipur
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              Your next place.
              <br />A clearer way to find it.
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
              From a plot for your plans to a home for your next chapter.
              Explore property across Jaipur, compare the details, and start a
              conversation with the team.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/properties">
                  Explore properties
                  <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Talk to the team</Link>
              </Button>
            </div>
          </div>
          <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-3xl sm:aspect-[21/8]">
            <Image
              alt=""
              fill
              loading="eager"
              sizes="(min-width: 1360px) 1280px, 100vw"
              src="/images/illustrations/villa.webp"
              className="object-cover object-center"
            />
            <span className="absolute bottom-4 left-4 rounded-lg bg-card px-3 py-2 text-xs text-card-foreground">
              Architecture inspiration · Stock photograph
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1360px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Start with what matters
          </p>
          <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
            Compare the details that shape a decision.
          </h2>
        </div>
        <div className="max-w-3xl">
          <p className="text-base leading-8 text-muted-foreground">
            Property needs vary from one search to the next. A home, a plot, a
            place to rent, and a space for work each call for different
            questions. Browse by the type of property and the Jaipur area that
            fits your plans, then review the information shown on each listing.
          </p>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Online details are a starting point. Confirm availability, price,
            measurements, terms, and supporting documents directly with the team
            before making a decision. Sending an enquiry does not reserve a
            property.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Browse property types
            </p>
            <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
              A search that starts with the right category.
            </h2>
            <Link
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline decoration-border underline-offset-4 hover:decoration-primary"
              href="/properties"
            >
              View all properties
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {propertyCategories.map((category, index) => (
              <li key={category}>
                <Link
                  className="group flex min-h-16 items-center justify-between gap-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={`/properties?category=${category}`}
                >
                  <span className="flex items-center gap-5">
                    <span className="font-sans text-sm font-bold tabular-nums text-primary/75">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold group-hover:text-primary">
                      {categoryLabels[category]}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-primary"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Explore Jaipur
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Find a starting point by locality.
            </h2>
          </div>
          <Link
            className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-primary underline decoration-border underline-offset-4 hover:decoration-primary sm:self-auto"
            href="/localities"
          >
            All localities
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {!localityResult.connected && (
          <p
            className="mt-6 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
            role="status"
          >
            Showing the default locality list while updated location data is
            unavailable.
          </p>
        )}
        {areasToShow.length ? (
          <ul className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {areasToShow.map((locality) => (
              <li className="border-t border-border" key={locality.slug}>
                <Link
                  className="flex min-h-14 items-center justify-between gap-4 py-3 text-sm font-semibold hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={`/properties?locality=${encodeURIComponent(locality.name)}`}
                >
                  {locality.name}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-primary"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            No localities are published yet. Browse the full property catalogue
            or contact the team for help.
          </p>
        )}
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Your next step
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
              Browse first. Ask when you are ready.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover hover:text-primary-hover-foreground"
              href="/properties"
            >
              Browse properties
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center rounded-xl border border-border px-5 text-sm font-bold transition-colors hover:bg-muted"
              href="/contact"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
