import { randomUUID } from "node:crypto";

import { BlogStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";

import { canManageBlog } from "@/features/blog/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import {
  checkRateLimit,
  getRequestIdentifier,
} from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const maxBytes = 10 * 1024 * 1024;
const assetMetadataSchema = z.object({
  postId: z.string().uuid(),
  altText: z.string().trim().min(3).max(300),
  caption: z.string().trim().max(500).optional().default(""),
  purpose: z.enum(["inline", "cover"]).default("inline"),
});

export async function POST(request: Request) {
  const rate = checkRateLimit({
    key: `blog-media:${getRequestIdentifier(request)}`,
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.allowed)
    return NextResponse.json(
      { error: "Too many uploads. Try again shortly." },
      { status: 429 },
    );
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !canManageBlog(access.profile.role))
    return NextResponse.json(
      { error: "Staff blog access is required." },
      { status: 403 },
    );
  const admin = createSupabaseAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Storage is not configured." },
      { status: 503 },
    );
  const form = await request.formData();
  const metadata = assetMetadataSchema.safeParse({
    postId: form.get("postId"),
    altText: form.get("altText"),
    caption: form.get("caption") || "",
    purpose: form.get("purpose") || "inline",
  });
  const file = form.get("file");
  if (!metadata.success || !(file instanceof File) || file.size > maxBytes)
    return NextResponse.json(
      { error: "Use a described JPG, PNG, or WebP image up to 10 MB." },
      { status: 400 },
    );
  const post = await prisma.blogPost.findUnique({
    where: { id: metadata.data.postId },
    select: { id: true, status: true },
  });
  if (!post)
    return NextResponse.json(
      { error: "Blog post not found." },
      { status: 404 },
    );
  if (post.status !== BlogStatus.DRAFT)
    return NextResponse.json(
      { error: "Move this post to draft before changing its images." },
      { status: 409 },
    );
  const buffer = Buffer.from(await file.arrayBuffer());
  let imageMetadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    imageMetadata = await sharp(buffer).metadata();
  } catch {
    return NextResponse.json(
      { error: "The selected file is not a valid image." },
      { status: 400 },
    );
  }
  if (
    !imageMetadata.format ||
    !["jpeg", "png", "webp"].includes(imageMetadata.format) ||
    !imageMetadata.width ||
    !imageMetadata.height ||
    imageMetadata.width > 12_000 ||
    imageMetadata.height > 12_000 ||
    imageMetadata.width * imageMetadata.height > 40_000_000
  )
    return NextResponse.json(
      { error: "Use a valid JPG, PNG, or WebP image within 40 megapixels." },
      { status: 400 },
    );
  const mimeByFormat = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  } as const;
  const detectedMime =
    mimeByFormat[imageMetadata.format as keyof typeof mimeByFormat];
  if (!detectedMime || (file.type && file.type !== detectedMime))
    return NextResponse.json(
      { error: "The image content does not match its declared file type." },
      { status: 400 },
    );
  const extension =
    imageMetadata.format === "jpeg" ? "jpg" : imageMetadata.format;
  const storagePath = `${access.profile.id}/${post.id}/${randomUUID()}.${extension}`;
  const upload = await admin.storage
    .from("blog-draft-media")
    .upload(storagePath, buffer, {
      contentType: detectedMime,
      upsert: false,
    });
  if (upload.error)
    return NextResponse.json(
      { error: "The blog image could not be uploaded." },
      { status: 502 },
    );
  try {
    const asset = await prisma.$transaction(async (tx) => {
      const created = await tx.blogAsset.create({
        data: {
          postId: post.id,
          uploadedById: access.profile.id,
          storagePath,
          bucket: "blog-draft-media",
          fileName: file.name.slice(0, 180),
          mimeType: detectedMime,
          sizeBytes: file.size,
          altText: metadata.data.altText,
          caption: metadata.data.caption || null,
          width: imageMetadata.width,
          height: imageMetadata.height,
        },
        select: {
          id: true,
          fileName: true,
          altText: true,
          caption: true,
          width: true,
          height: true,
        },
      });
      if (metadata.data.purpose === "cover")
        await tx.blogPost.update({
          where: { id: post.id },
          data: { coverAssetId: created.id, version: { increment: 1 } },
        });
      return created;
    });
    const signed = await admin.storage
      .from("blog-draft-media")
      .createSignedUrl(storagePath, 30 * 60);
    return NextResponse.json({
      ok: true,
      asset: { ...asset, url: signed.data?.signedUrl ?? null },
      purpose: metadata.data.purpose,
    });
  } catch {
    await admin.storage.from("blog-draft-media").remove([storagePath]);
    return NextResponse.json(
      { error: "The blog image could not be saved." },
      { status: 500 },
    );
  }
}
