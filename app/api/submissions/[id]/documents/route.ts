import { NextResponse } from "next/server";

import { allowedDocumentTypes, documentUploadSchema, getSafeDocumentExtension, maxDocumentBytes } from "@/features/submissions/documents";
import { canEditOwnerSubmission } from "@/features/submissions/service";
import { provisionProfile } from "@/lib/auth/profile";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rateLimit = checkRateLimit({ key: `submission-document:${getRequestIdentifier(request)}`, limit: 20, windowMs: 15 * 60 * 1000 });
  if (!rateLimit.allowed) return NextResponse.json({ error: "Too many document uploads. Try again shortly." }, { status: 429 });
  const access = await getCurrentUserAccess();
  if (access.mode === "unauthenticated") return NextResponse.json({ error: "Sign in to upload a document." }, { status: 401 });
  if (access.mode === "setup" || access.mode === "database_setup") return NextResponse.json({ error: "Document storage is not configured yet." }, { status: 503 });
  const ownerId = access.mode === "profile_setup" ? (await provisionProfile(access.user)).id : access.profile.id;
  const submissionId = (await params).id;
  const formData = await request.formData();
  const file = formData.get("file");
  const parsed = documentUploadSchema.safeParse({ documentType: formData.get("documentType") });
  if (!parsed.success || !(file instanceof File)) return NextResponse.json({ error: "Choose a document and document type." }, { status: 400 });
  if (!allowedDocumentTypes.includes(file.type as (typeof allowedDocumentTypes)[number]) || file.size <= 0 || file.size > maxDocumentBytes) return NextResponse.json({ error: "Use a PDF, JPG, or PNG file up to 10 MB." }, { status: 400 });
  const extension = getSafeDocumentExtension(file.name, file.type);
  if (!extension) return NextResponse.json({ error: "The file extension does not match its type." }, { status: 400 });

  const submission = await prisma.propertySubmission.findFirst({ where: { id: submissionId, ownerId }, select: { id: true, status: true, referenceNumber: true } });
  if (!submission || !canEditOwnerSubmission(submission.status)) return NextResponse.json({ error: "This submission cannot accept documents." }, { status: 400 });
  const documentCount = await prisma.propertyDocument.count({ where: { submissionId } });
  if (documentCount >= 10) return NextResponse.json({ error: "A submission can contain up to 10 documents." }, { status: 400 });

  const storage = createSupabaseAdminClient();
  if (!storage) return NextResponse.json({ error: "Private document storage is not configured yet." }, { status: 503 });
  const storagePath = `${ownerId}/${submissionId}/${crypto.randomUUID()}.${extension}`;
  const upload = await storage.storage.from("property-documents").upload(storagePath, file, { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ error: "The document could not be uploaded." }, { status: 400 });

  try {
    const document = await prisma.propertyDocument.create({ data: { submissionId, storagePath, documentType: parsed.data.documentType, fileName: file.name.slice(0, 180), mimeType: file.type, sizeBytes: file.size }, select: { id: true, fileName: true, documentType: true, sizeBytes: true } });
    return NextResponse.json({ document }, { status: 201 });
  } catch {
    await storage.storage.from("property-documents").remove([storagePath]);
    return NextResponse.json({ error: "The document could not be recorded." }, { status: 500 });
  }
}
