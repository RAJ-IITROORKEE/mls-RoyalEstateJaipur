import { MediaType, PropertyStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { getRequestIdentifier, checkRateLimit } from "@/lib/security/rate-limit";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { mediaTypes, mediaUpdateSchema, mediaUploadSchema, maxMediaBytes, getSafeMediaExtension } from "@/features/properties/media";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

const editableStatuses: PropertyStatus[] = [PropertyStatus.DRAFT, PropertyStatus.PUBLISHED, PropertyStatus.PAUSED];

async function getAccess(propertyId: string, actorId: string, role: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true, ownerId: true, status: true } });
  if (!property || !editableStatuses.includes(property.status)) return null;
  const staff = role === "ADMIN" || role === "SUPER_ADMIN";
  return staff || property.ownerId === actorId ? property : null;
}

export async function POST(request: Request, { params }: RouteContext) {
  const limit = checkRateLimit({ key: `property-media:${getRequestIdentifier(request)}`, limit: 20, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } });
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile) return NextResponse.json({ error: "You must be signed in to manage media." }, { status: 401 });
  const propertyId = (await params).id;
  const property = await getAccess(propertyId, access.profile.id, access.profile.role);
  if (!property) return NextResponse.json({ error: "You cannot manage media for this property." }, { status: 403 });
  const formData = await request.formData();
  const file = formData.get("file");
  const parsed = mediaUploadSchema.safeParse({ altText: formData.get("altText") });
  if (!parsed.success || !(file instanceof File) || !mediaTypes.includes(file.type as (typeof mediaTypes)[number]) || file.size <= 0 || file.size > maxMediaBytes || !getSafeMediaExtension(file.name, file.type)) return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image up to 10 MB with matching file details." }, { status: 400 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Media storage is not configured yet." }, { status: 503 });
  const extension = getSafeMediaExtension(file.name, file.type);
  if (!extension) return NextResponse.json({ error: "The image extension does not match its type." }, { status: 400 });
  const storagePath = `${property.ownerId}/${property.id}/${crypto.randomUUID()}.${extension}`;
  const upload = await admin.storage.from("property-media").upload(storagePath, file, { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ error: "The image could not be uploaded." }, { status: 502 });
  try {
    const media = await prisma.propertyMedia.create({ data: { propertyId: property.id, storagePath, type: MediaType.IMAGE, altText: parsed.data.altText, isCover: false }, select: { id: true, storagePath: true, altText: true, sortOrder: true, isCover: true } });
    return NextResponse.json({ media }, { status: 201 });
  } catch {
    await admin.storage.from("property-media").remove([storagePath]);
    return NextResponse.json({ error: "The image could not be registered." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile) return NextResponse.json({ error: "You must be signed in to manage media." }, { status: 401 });
  const propertyId = (await params).id;
  const property = await getAccess(propertyId, access.profile.id, access.profile.role);
  if (!property) return NextResponse.json({ error: "You cannot manage media for this property." }, { status: 403 });
  const parsed = mediaUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "The media update is invalid." }, { status: 400 });
  try {
    const updated = await prisma.$transaction(async (transaction) => {
      const media = await transaction.propertyMedia.findFirst({ where: { id: parsed.data.mediaId, propertyId } });
      if (!media) throw new Error("Media not found.");
      if (parsed.data.isCover) await transaction.propertyMedia.updateMany({ where: { propertyId }, data: { isCover: false } });
      return transaction.propertyMedia.update({ where: { id: media.id }, data: { altText: parsed.data.altText, sortOrder: parsed.data.sortOrder, isCover: parsed.data.isCover } });
    });
    return NextResponse.json({ media: { id: updated.id, altText: updated.altText, sortOrder: updated.sortOrder, isCover: updated.isCover } });
  } catch {
    return NextResponse.json({ error: "The media item could not be updated." }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile) return NextResponse.json({ error: "You must be signed in to manage media." }, { status: 401 });
  const propertyId = (await params).id;
  const property = await getAccess(propertyId, access.profile.id, access.profile.role);
  if (!property) return NextResponse.json({ error: "You cannot manage media for this property." }, { status: 403 });
  const body = await request.json().catch(() => null) as { mediaId?: unknown } | null;
  const mediaId = typeof body?.mediaId === "string" ? body.mediaId : "";
  const media = await prisma.propertyMedia.findFirst({ where: { id: mediaId, propertyId }, select: { id: true, storagePath: true } });
  if (!media) return NextResponse.json({ error: "Media item not found." }, { status: 404 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Media storage is not configured yet." }, { status: 503 });
  const removed = await admin.storage.from("property-media").remove([media.storagePath]);
  if (removed.error) return NextResponse.json({ error: "The image could not be removed." }, { status: 502 });
  await prisma.propertyMedia.delete({ where: { id: media.id } });
  return NextResponse.json({ removed: true });
}
