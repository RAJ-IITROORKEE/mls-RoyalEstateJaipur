import { randomUUID } from "node:crypto";

import { BlogStatus, Prisma, type ProfileRole } from "@prisma/client";

import {
  blogContentSchema,
  blogPostInputSchema,
  collectBlogAssetIds,
  hasMeaningfulBlogContent,
  type BlogContent,
} from "@/features/blog/schemas";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicBlogMediaUrl } from "@/lib/supabase/blog-url";

const draftBucket = "blog-draft-media";
const publicBucket = "blog-media";

export function canManageBlog(role: ProfileRole) {
  return role === "REVIEWER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function getAdminBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      readingMinutes: true,
      updatedAt: true,
      publishedAt: true,
      author: { select: { displayName: true, email: true } },
      coverAsset: {
        select: { storagePath: true, bucket: true, altText: true },
      },
    },
  });
  const admin = createSupabaseAdminClient();
  return Promise.all(
    posts.map(async (post) => {
      if (!post.coverAsset) return { ...post, coverUrl: null };
      if (post.coverAsset.bucket === publicBucket)
        return {
          ...post,
          coverUrl: getPublicBlogMediaUrl(post.coverAsset.storagePath),
        };
      if (!admin) return { ...post, coverUrl: null };
      const signed = await admin.storage
        .from(draftBucket)
        .createSignedUrl(post.coverAsset.storagePath, 30 * 60);
      return { ...post, coverUrl: signed.data?.signedUrl ?? null };
    }),
  );
}

export async function getAdminBlogPost(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      assets: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!post) return null;
  const admin = createSupabaseAdminClient();
  const assets = await Promise.all(
    post.assets.map(async (asset) => {
      if (asset.bucket === publicBucket)
        return { ...asset, url: getPublicBlogMediaUrl(asset.storagePath) };
      if (!admin) return { ...asset, url: null };
      const signed = await admin.storage
        .from(draftBucket)
        .createSignedUrl(asset.storagePath, 30 * 60);
      return { ...asset, url: signed.data?.signedUrl ?? null };
    }),
  );
  return { ...post, assets };
}

export async function getPublishedBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    where: { status: BlogStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      readingMinutes: true,
      publishedAt: true,
      coverAsset: {
        select: { storagePath: true, bucket: true, altText: true },
      },
    },
  });
  return posts.map((post) => ({
    ...post,
    coverUrl:
      post.coverAsset?.bucket === publicBucket
        ? getPublicBlogMediaUrl(post.coverAsset.storagePath)
        : null,
  }));
}

export async function getPublishedBlogSlugs() {
  const posts = await prisma.blogPost.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: { slug: true },
    take: 5000,
  });
  return posts.map((post) => post.slug);
}

export async function getPublishedBlogPost(slug: string) {
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: BlogStatus.PUBLISHED },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      readingMinutes: true,
      seoTitle: true,
      seoDescription: true,
      publishedAt: true,
      coverAssetId: true,
      assets: {
        where: { bucket: publicBucket },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          storagePath: true,
          altText: true,
          caption: true,
          width: true,
          height: true,
        },
      },
    },
  });
  if (!post) return null;
  return {
    ...post,
    assets: post.assets.map((asset) => ({
      ...asset,
      url: getPublicBlogMediaUrl(asset.storagePath),
    })),
  };
}

async function verifyContentAssets(postId: string, content: BlogContent) {
  const assetIds = collectBlogAssetIds(content);
  if (assetIds.length === 0) return;
  const ownedAssets = await prisma.blogAsset.count({
    where: { id: { in: assetIds }, postId },
  });
  if (ownedAssets !== assetIds.length)
    throw new Error("Blog content includes an unavailable managed image.");
}

export async function saveBlogPost(
  authorId: string,
  id: string | undefined,
  input: unknown,
) {
  const parsed = blogPostInputSchema.parse(input);
  const content = blogContentSchema.parse(parsed.content);
  const data = {
    title: parsed.title,
    slug: parsed.slug,
    excerpt: parsed.excerpt || null,
    content: content as Prisma.InputJsonValue,
    readingMinutes: parsed.readingMinutes,
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
  };
  if (id) {
    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) throw new Error("Blog post not found.");
    if (existing.status !== BlogStatus.DRAFT)
      throw new Error("Move this post to draft before editing it.");
    await verifyContentAssets(id, content);
    return prisma.blogPost.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    });
  }
  return prisma.blogPost.create({ data: { ...data, authorId } });
}

type Transfer = {
  id: string;
  oldBucket: string;
  oldPath: string;
  newBucket: string;
  newPath: string;
};

async function copyAssetsForStatus(
  assets: { id: string; bucket: string; storagePath: string }[],
  destinationBucket: string,
) {
  const admin = createSupabaseAdminClient();
  if (assets.length > 0 && !admin)
    throw new Error("Blog media storage is not configured.");
  const copied: Transfer[] = [];
  try {
    for (const asset of assets) {
      if (asset.bucket === destinationBucket) continue;
      const extension =
        asset.storagePath.split(".").pop()?.toLowerCase() || "jpg";
      const newPath = `${asset.id}/${randomUUID()}.${extension}`;
      const result = await admin!.storage
        .from(asset.bucket)
        .copy(asset.storagePath, newPath, { destinationBucket });
      if (result.error)
        throw new Error("A managed blog image could not be transferred.");
      copied.push({
        id: asset.id,
        oldBucket: asset.bucket,
        oldPath: asset.storagePath,
        newBucket: destinationBucket,
        newPath,
      });
    }
    return copied;
  } catch (error) {
    await Promise.all(
      copied.map((asset) =>
        admin!.storage.from(asset.newBucket).remove([asset.newPath]),
      ),
    );
    throw error;
  }
}

export async function updateBlogStatus(
  actorId: string,
  id: string,
  status: BlogStatus,
) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      version: true,
      content: true,
      coverAssetId: true,
      assets: { select: { id: true, bucket: true, storagePath: true } },
    },
  });
  if (!post) throw new Error("Blog post not found.");
  if (post.status === status) return post;
  const content = blogContentSchema.parse(post.content);
  if (status === BlogStatus.PUBLISHED && !hasMeaningfulBlogContent(content))
    throw new Error("Add blog content before publishing this post.");
  const referenced = new Set(collectBlogAssetIds(content));
  if (post.coverAssetId) referenced.add(post.coverAssetId);
  if (status === BlogStatus.PUBLISHED && !post.coverAssetId)
    throw new Error("Add a cover image before publishing this blog post.");
  const selectedAssets =
    status === BlogStatus.PUBLISHED
      ? post.assets.filter((asset) => referenced.has(asset.id))
      : post.status === BlogStatus.PUBLISHED
        ? post.assets.filter((asset) => asset.bucket === publicBucket)
        : [];
  if (
    status === BlogStatus.PUBLISHED &&
    selectedAssets.length !== referenced.size
  )
    throw new Error("One or more managed blog images are unavailable.");
  const destinationBucket =
    status === BlogStatus.PUBLISHED ? publicBucket : draftBucket;
  const copied = await copyAssetsForStatus(selectedAssets, destinationBucket);
  const admin = createSupabaseAdminClient();
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const guarded = await tx.blogPost.updateMany({
        where: { id, status: post.status, version: post.version },
        data: {
          status,
          publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
          version: { increment: 1 },
        },
      });
      if (guarded.count !== 1)
        throw new Error("This blog post changed. Refresh before trying again.");
      for (const asset of copied) {
        await tx.blogAsset.update({
          where: { id: asset.id },
          data: { bucket: asset.newBucket, storagePath: asset.newPath },
        });
      }
      await tx.auditLog.create({
        data: {
          actorId,
          action: `BLOG_${status}`,
          entityType: "BlogPost",
          entityId: id,
          summary: `${post.title} marked ${status.toLowerCase()}`,
          metadata: { previousStatus: post.status, assetCount: copied.length },
        },
      });
      return tx.blogPost.findUniqueOrThrow({ where: { id } });
    });
    if (admin)
      await Promise.all(
        copied.map((asset) =>
          admin.storage.from(asset.oldBucket).remove([asset.oldPath]),
        ),
      );
    return updated;
  } catch (error) {
    if (admin)
      await Promise.all(
        copied.map((asset) =>
          admin.storage.from(asset.newBucket).remove([asset.newPath]),
        ),
      );
    throw error;
  }
}
