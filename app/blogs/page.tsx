import { ArrowUpRight, BookOpenText, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { PublicPage } from "@/components/layout/public-page";
import { getPublishedBlogPosts } from "@/features/blog/service";
import { parseJournalPage } from "@/features/blog/pagination";

type JournalPageProps = { searchParams: Promise<{ page?: string | string[] }> };

export async function generateMetadata({
  searchParams,
}: JournalPageProps): Promise<Metadata> {
  const page = parseJournalPage((await searchParams).page);
  return {
    title: page > 1 ? `Property journal — page ${page}` : "Property journal",
    description:
      "Practical guidance for buying, renting, and presenting property in Jaipur.",
    alternates: { canonical: page > 1 ? `/blogs?page=${page}` : "/blogs" },
  };
}

export default async function BlogsPage({ searchParams }: JournalPageProps) {
  const params = await searchParams;
  const page = parseJournalPage(params.page);
  const result = await getPublishedBlogPosts({ page });
  return (
    <PublicPage>
      <section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 sm:py-24">
        <header className="max-w-4xl">
          <p className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <BookOpenText aria-hidden="true" className="size-4" />
            From the studio
          </p>
          <h1 className="mt-6 max-w-4xl text-balance font-serif text-5xl leading-[1.06] sm:text-6xl lg:text-7xl">
            Notes for better
            <span className="mt-1 block text-primary">property decisions.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Practical guidance for buying, renting, and presenting a property in
            Jaipur.
          </p>
          <div className="mt-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span aria-hidden="true" className="h-px w-10 bg-primary" />
            Clear answers for your next move
          </div>
        </header>
        {!result.connected ? (
          <div
            className="mt-12 rounded-2xl border border-dashed border-border p-8"
            role="status"
          >
            <h2 className="font-serif text-3xl">
              The journal is temporarily unavailable.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Please try again shortly, or contact our team if you need help
              with a property decision.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
              href="/blogs"
            >
              Try again
            </Link>
          </div>
        ) : result.posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-8">
            <h2 className="font-serif text-3xl">
              {page > 1
                ? "No more articles on this page."
                : "Stories are on the way."}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {page > 1
                ? "Return to the previous page to browse the published guides."
                : "Our editorial team is preparing the first guides."}
            </p>
          </div>
        ) : (
          <div className="mt-12 grid items-stretch gap-5 md:grid-cols-2">
            {result.posts.map((post, index) => (
              <Link
                aria-label={`Read article: ${post.title}`}
                className={`journal-card group flex h-full flex-col overflow-hidden rounded-2xl border transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background ${index === 0 ? "journal-card--featured border-primary/35 bg-spotlight text-spotlight-foreground" : "border-border bg-card text-foreground"}`}
                data-featured={index === 0 ? "true" : "false"}
                href={`/blogs/${post.slug}`}
                key={post.id}
              >
                {post.coverUrl && (
                  <div className="relative aspect-[16/9] bg-muted">
                    <Image
                      alt={post.coverAsset?.altText ?? ""}
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      src={post.coverUrl}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div
                    className={`flex items-center justify-between gap-4 border-b pb-4 ${index === 0 ? "border-spotlight-foreground/20" : "border-border"}`}
                  >
                    <span
                      className={`inline-flex min-h-9 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${index === 0 ? "text-spotlight-accent" : "text-primary"}`}
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
                  <h2
                    className={`mt-5 font-serif text-2xl leading-snug sm:text-3xl ${index === 0 ? "text-spotlight-foreground group-hover:text-spotlight-accent" : "text-foreground group-hover:text-primary"}`}
                  >
                    {post.title}
                  </h2>
                  <p
                    className={`mt-3 flex-1 text-sm leading-7 ${index === 0 ? "text-spotlight-foreground/75" : "text-muted-foreground"}`}
                  >
                    {post.excerpt ||
                      "A practical note from Royal Estates Jaipur."}
                  </p>
                  <span className="mt-7 inline-flex min-h-11 items-center justify-between gap-3 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors group-hover:bg-primary-hover group-hover:text-primary-hover-foreground">
                    Read article
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {result.connected && (page > 1 || result.hasNextPage) ? (
          <nav
            aria-label="Journal pagination"
            className="mt-10 flex flex-wrap items-center justify-between gap-4"
          >
            {page > 1 ? (
              <Link
                className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-semibold hover:bg-muted"
                href={page === 2 ? "/blogs" : `/blogs?page=${page - 1}`}
              >
                Previous articles
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted-foreground">Page {page}</span>
            {result.hasNextPage && page < 1000 ? (
              <Link
                className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground"
                href={`/blogs?page=${page + 1}`}
              >
                More articles
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </PublicPage>
  );
}
