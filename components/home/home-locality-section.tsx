import Link from "next/link";

type Locality = { name: string; slug: string; isFeatured: boolean };

export function HomeLocalitySection({ localities }: { localities: Locality[] }) {
  const featuredLocalities = localities.filter((locality) => locality.isFeatured).slice(0, 8);
  if (!featuredLocalities.length) return null;

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Find your area
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Browse by locality
            </h2>
          </div>
          <Link
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline decoration-border underline-offset-4 hover:decoration-primary"
            href="/localities"
          >
            View all locations
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {featuredLocalities.map((locality) => (
            <li key={locality.slug}>
              <Link
                className="flex min-h-12 items-center rounded-xl border border-border px-3 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={`/properties?locality=${encodeURIComponent(locality.name)}`}
              >
                {locality.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
