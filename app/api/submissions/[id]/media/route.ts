import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { canEditOwnerSubmission } from "@/features/submissions/service";
import {
  getSubmissionMediaExtension,
  maxSubmissionMediaBytes,
  maxSubmissionMediaCount,
  submissionMediaMetadataSchema,
  submissionMediaTypes,
  submissionMediaUpdateSchema,
} from "@/features/submissions/media";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getCurrentUserAccess();
  const { id } = await params;
  if (access.mode !== "authorized" || access.profile.id === undefined)
    return NextResponse.json(
      { error: "Sign in to view submission images." },
      { status: 401 },
    );
  const submission = await prisma.propertySubmission.findFirst({
    where: { id, ownerId: access.profile.id },
    select: { id: true },
  });
  if (!submission)
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ media: [] });
  const media = await prisma.propertySubmissionMedia.findMany({
    where: { submissionId: id },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      fileName: true,
      altText: true,
      width: true,
      height: true,
      sortOrder: true,
      isCover: true,
      storagePath: true,
    },
  });
  const withUrls = await Promise.all(
    media.map(async (item) => {
      const { data } = await admin.storage
        .from("property-submission-media")
        .createSignedUrl(item.storagePath, 3600);
      return { ...item, storagePath: undefined, url: data?.signedUrl ?? null };
    }),
  );
  return NextResponse.json({ media: withUrls });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getCurrentUserAccess();
  const { id } = await params;
  if (access.mode !== "authorized")
    return NextResponse.json(
      { error: "Sign in to upload preview images." },
      { status: 401 },
    );
  const submission = await prisma.propertySubmission.findFirst({
    where: { id, ownerId: access.profile.id },
    select: { id: true, status: true },
  });
  if (!submission)
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  if (!canEditOwnerSubmission(submission.status))
    return NextResponse.json(
      { error: "This submission is no longer editable." },
      { status: 409 },
    );
  const admin = createSupabaseAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Storage is not configured." },
      { status: 503 },
    );
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File))
    return NextResponse.json(
      { error: "Choose an image to upload." },
      { status: 400 },
    );
  if (
    !submissionMediaTypes.includes(
      file.type as (typeof submissionMediaTypes)[number],
    ) ||
    file.size > maxSubmissionMediaBytes
  )
    return NextResponse.json(
      { error: "Use a JPG or PNG image up to 10 MB." },
      { status: 400 },
    );
  const extension = getSubmissionMediaExtension(file.name, file.type);
  if (!extension)
    return NextResponse.json(
      { error: "The file extension must match its image type." },
      { status: 400 },
    );
  const currentCount = await prisma.propertySubmissionMedia.count({
    where: { submissionId: id },
  });
  if (currentCount >= maxSubmissionMediaCount)
    return NextResponse.json(
      { error: "You can add up to 5 preview images." },
      { status: 409 },
    );
  const metadata = submissionMediaMetadataSchema.safeParse({
    altText: formData.get("altText"),
    width: formData.get("width"),
    height: formData.get("height"),
  });
  if (!metadata.success)
    return NextResponse.json(
      { error: "Add valid image dimensions and alt text." },
      { status: 400 },
    );
  const storagePath = `${access.profile.id}/${id}/${randomUUID()}.${extension}`;
  const upload = await admin.storage
    .from("property-submission-media")
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (upload.error)
    return NextResponse.json(
      { error: "The image could not be uploaded." },
      { status: 502 },
    );
  try {
    const media = await prisma.propertySubmissionMedia.create({
      data: {
        submissionId: id,
        storagePath,
        fileName: file.name.slice(0, 180),
        mimeType: file.type,
        sizeBytes: file.size,
        altText: metadata.data.altText,
        sortOrder: currentCount,
        isCover: currentCount === 0,
        width: metadata.data.width,
        height: metadata.data.height,
      },
      select: {
        id: true,
        fileName: true,
        altText: true,
        width: true,
        height: true,
        sortOrder: true,
        isCover: true,
      },
    });
    return NextResponse.json({ ok: true, media });
  } catch {
    await admin.storage.from("property-submission-media").remove([storagePath]);
    return NextResponse.json(
      { error: "The image could not be saved." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getCurrentUserAccess();
  const { id } = await params;
  if (access.mode !== "authorized")
    return NextResponse.json(
      { error: "Sign in to edit preview images." },
      { status: 401 },
    );

  const submission = await prisma.propertySubmission.findFirst({
    where: { id, ownerId: access.profile.id },
    select: { id: true, status: true },
  });
  if (!submission)
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  if (!canEditOwnerSubmission(submission.status))
    return NextResponse.json(
      { error: "This submission is no longer editable." },
      { status: 409 },
    );

  const mediaId = new URL(request.url).searchParams.get("mediaId");
  if (!mediaId)
    return NextResponse.json(
      { error: "Image identifier is required." },
      { status: 400 },
    );
  const parsed = submissionMediaUpdateSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Image details are invalid." },
      { status: 400 },
    );

  try {
    const media = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.propertySubmissionMedia.findFirst({
        where: { id: mediaId, submissionId: id },
        select: { id: true },
      });
      if (!existing) throw new Error("Image not found.");
      if (parsed.data.isCover) {
        await transaction.propertySubmissionMedia.updateMany({
          where: { submissionId: id },
          data: { isCover: false },
        });
      }
      return transaction.propertySubmissionMedia.update({
        where: { id: mediaId },
        data: parsed.data,
        select: {
          id: true,
          fileName: true,
          altText: true,
          width: true,
          height: true,
          sortOrder: true,
          isCover: true,
        },
      });
    });
    return NextResponse.json({ ok: true, media });
  } catch {
    return NextResponse.json(
      { error: "Image could not be updated." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getCurrentUserAccess();
  const { id } = await params;
  if (access.mode !== "authorized")
    return NextResponse.json(
      { error: "Sign in to remove preview images." },
      { status: 401 },
    );

  const submission = await prisma.propertySubmission.findFirst({
    where: { id, ownerId: access.profile.id },
    select: { id: true, status: true },
  });
  if (!submission)
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  if (!canEditOwnerSubmission(submission.status))
    return NextResponse.json(
      { error: "This submission is no longer editable." },
      { status: 409 },
    );

  const mediaId = new URL(request.url).searchParams.get("mediaId");
  if (!mediaId)
    return NextResponse.json(
      { error: "Image identifier is required." },
      { status: 400 },
    );
  const media = await prisma.propertySubmissionMedia.findFirst({
    where: { id: mediaId, submissionId: id },
    select: { id: true, storagePath: true, isCover: true },
  });
  if (!media)
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  const admin = createSupabaseAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Storage is not configured." },
      { status: 503 },
    );

  const removed = await admin.storage
    .from("property-submission-media")
    .remove([media.storagePath]);
  if (removed.error)
    return NextResponse.json(
      { error: "Image could not be removed." },
      { status: 502 },
    );
  await prisma.propertySubmissionMedia.delete({ where: { id: media.id } });
  if (media.isCover) {
    const replacement = await prisma.propertySubmissionMedia.findFirst({
      where: { submissionId: id },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    if (replacement)
      await prisma.propertySubmissionMedia.update({
        where: { id: replacement.id },
        data: { isCover: true },
      });
  }
  return NextResponse.json({ ok: true });
}
