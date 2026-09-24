import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicPage } from "@/components/layout/public-page";
import { BlogContentRenderer } from "@/components/blog/blog-content";
import { getPublishedBlogPost } from "@/features/blog/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const result = await getPublishedBlogPost((await params).slug);
  if (!result.connected)
    return {
      title: "Journal temporarily unavailable",
      robots: { index: false, follow: false },
    };
  const post = result.post;
  return post
    ? {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || undefined,
        alternates: { canonical: `/blogs/${post.slug}` },
        openGraph: {
          title: post.seoTitle || post.title,
          description: post.seoDescription || post.excerpt || undefined,
          images: post.assets.find((asset) => asset.id === post.coverAssetId)
            ?.url
            ? [
                post.assets.find((asset) => asset.id === post.coverAssetId)!
                  .url!,
              ]
            : undefined,
        },
      }
    : { title: "Blog" };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const result = await getPublishedBlogPost((await params).slug);
  if (!result.connected)
    return (
      <PublicPage>
        <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Journal
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            This story is temporarily unavailable.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
            Please try again shortly. The property catalogue and contact page
            are available in the meantime.
          </p>
          <Link
            className="mt-8 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
            href="/blogs"
          >
            Return to the journal
          </Link>
        </section>
      </PublicPage>
    );
  const post = result.post;
  if (!post) notFound();
  const coverAsset = post.assets.find(
    (asset) => asset.id === post.coverAssetId,
  );
  return (
    <PublicPage>
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Royal Estates Jaipur journal · {post.readingMinutes} min read
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        {coverAsset?.url && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
            <Image
              alt={coverAsset.altText}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              src={coverAsset.url}
            />
          </div>
        )}
        <div className="mt-12">
          <BlogContentRenderer assets={post.assets} content={post.content} />
        </div>
      </article>
    </PublicPage>
  );
}
