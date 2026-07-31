import { hasDatabaseConfiguration } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const queueStatuses = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "RESUBMITTED",
  "NEEDS_CHANGES",
  "APPROVED",
  "REJECTED",
] as const;

export async function getModerationQueue(status?: string) {
  if (!hasDatabaseConfiguration())
    return { connected: false as const, submissions: [] };
  try {
    const submissions = await prisma.propertySubmission.findMany({
      where:
        status && (queueStatuses as readonly string[]).includes(status)
          ? { status: status as (typeof queueStatuses)[number] }
          : { status: { in: ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED"] } },
      orderBy: [{ submittedAt: "asc" }, { updatedAt: "asc" }],
      take: 50,
      select: {
        id: true,
        referenceNumber: true,
        intent: true,
        category: true,
        status: true,
        submittedAt: true,
        updatedAt: true,
        owner: { select: { displayName: true, email: true } },
      },
    });
    return { connected: true as const, submissions };
  } catch {
    return { connected: false as const, submissions: [] };
  }
}

export async function getModerationSubmission(submissionId: string) {
  if (!hasDatabaseConfiguration()) return null;
  const submission = await prisma.propertySubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      ownerId: true,
      referenceNumber: true,
      intent: true,
      category: true,
      status: true,
      payload: true,
      reason: true,
      submittedAt: true,
      updatedAt: true,
      owner: { select: { displayName: true, email: true, phone: true } },
      documents: {
        select: {
          id: true,
          fileName: true,
          documentType: true,
          mimeType: true,
          sizeBytes: true,
          storagePath: true,
        },
      },
      media: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          fileName: true,
          altText: true,
          width: true,
          height: true,
          isCover: true,
          storagePath: true,
        },
      },
    },
  });
  if (!submission) return null;

  const admin = createSupabaseAdminClient();
  const media = admin
    ? await Promise.all(
        submission.media.map(async (item) => {
          const { data } = await admin.storage
            .from("property-submission-media")
            .createSignedUrl(item.storagePath, 1800);
          return {
            id: item.id,
            fileName: item.fileName,
            altText: item.altText,
            width: item.width,
            height: item.height,
            isCover: item.isCover,
            url: data?.signedUrl ?? null,
          };
        }),
      )
    : [];

  return { ...submission, media };
}
