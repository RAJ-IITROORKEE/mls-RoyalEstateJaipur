import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { PublicPage } from "@/components/layout/public-page";
import { getPublishedBlogPosts } from "@/features/blog/service";

export default async function BlogsPage() {
  const result = await getPublishedBlogPosts();
  return (
    <PublicPage>
      <section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          From the studio
        </p>
        <h1 className="mt-3 max-w-3xl text-balance font-serif text-5xl leading-tight sm:text-6xl">
          Notes for better property decisions.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
          Practical guidance for buying, renting, and presenting a
          property in Jaipur.
        </p>
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
            <h2 className="font-serif text-3xl">Stories are on the way.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Our editorial team is preparing the first guides.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {result.posts.map((post, index) => (
              <Link
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
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
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                    <span className="text-3xl font-bold tabular-nums tracking-tight text-primary/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {post.readingMinutes} min read
                    </span>
                  </div>
                  <h2 className="mt-5 font-serif text-2xl leading-snug sm:text-3xl">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {post.excerpt || "A practical note from Royal Estates Jaipur."}
                  </p>
                  <span className="mt-6 inline-flex min-h-6 items-center gap-2 text-sm font-bold text-foreground">
                    Read article
                    <ArrowUpRight aria-hidden="true" className="size-4 text-primary" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicPage>
  );
}
