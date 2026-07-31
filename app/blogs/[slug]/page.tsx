import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { PublicPage } from "@/components/layout/public-page";
import { BlogContentRenderer } from "@/components/blog/blog-content";
import { getPublishedBlogPost } from "@/features/blog/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getPublishedBlogPost((await params).slug);
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
  const post = await getPublishedBlogPost((await params).slug);
  if (!post) notFound();
  const coverAsset = post.assets.find(
    (asset) => asset.id === post.coverAssetId,
  );
  return (
    <PublicPage>
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          RoyaleStateJaipur journal · {post.readingMinutes} min read
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
