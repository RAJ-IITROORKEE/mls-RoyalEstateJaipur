import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PublicPage } from "@/components/layout/public-page";
import { getPublicLocalities } from "@/features/site-content/queries";

export const metadata: Metadata = {
  title: "Explore localities",
  description:
    "Browse property search locations managed by the Royal Estates Jaipur team.",
  alternates: { canonical: "/localities" },
};

export default async function LocalitiesPage() {
  const result = await getPublicLocalities();

  return (
    <PublicPage>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Explore by area
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.96] sm:text-6xl">
            Start with the location that matters to you.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            Choose a locality to see published listings associated with that
            area. Availability is confirmed directly with the team.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 sm:py-20">
        {!result.connected && (
          <p
            className="mb-7 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
            role="status"
          >
            Showing the default location list while updated location data is
            unavailable.
          </p>
        )}
        {result.localities.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.localities.map((locality) => (
              <li key={locality.slug}>
                <Link
                  className="group flex min-h-20 items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/45 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={
                    "/properties?locality=" + encodeURIComponent(locality.name)
                  }
                >
                  <span>
                    <span className="block font-semibold">{locality.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      View matching properties
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
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8">
            <h2 className="font-serif text-3xl">
              No locations are published yet.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Try the full property search or contact the team for help.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
              href="/properties"
            >
              Browse properties
            </Link>
          </div>
        )}
      </section>
    </PublicPage>
  );
}
