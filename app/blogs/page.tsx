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
        <h1 className="mt-3 font-serif text-5xl">
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
            {result.posts.map((post) => (
              <Link
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40"
                href={`/blogs/${post.slug}`}
                key={post.id}
              >
                <div className="relative aspect-[16/9] bg-muted">
                  {post.coverUrl ? (
                    <Image
                      alt={post.coverAsset?.altText ?? ""}
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      src={post.coverUrl}
                    />
                  ) : null}
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    {post.readingMinutes} min read
                  </p>
                  <h2 className="mt-5 font-serif text-3xl">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {post.excerpt || "A practical note from Royal Estates Jaipur."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicPage>
  );
}
