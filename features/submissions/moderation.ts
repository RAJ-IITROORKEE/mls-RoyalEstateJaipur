import {
  PropertyCategory,
  PropertyIntent,
  PropertyStatus,
  type ProfileRole,
} from "@prisma/client";

import { submissionFinalSchema } from "@/features/submissions/schemas";
import { assertSubmissionTransition } from "@/features/submissions/transitions";
import { toPropertySlug } from "@/features/properties/domain";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ModerationAction =
  | "START_REVIEW"
  | "REQUEST_CHANGES"
  | "REJECT"
  | "APPROVE"
  | "APPROVE_AND_PUBLISH";

const targets: Record<
  Exclude<ModerationAction, "START_REVIEW">,
  "NEEDS_CHANGES" | "REJECTED" | "APPROVED"
> = {
  REQUEST_CHANGES: "NEEDS_CHANGES",
  REJECT: "REJECTED",
  APPROVE: "APPROVED",
  APPROVE_AND_PUBLISH: "APPROVED",
};

export async function startSubmissionReview(
  submissionId: string,
  reviewerId: string,
) {
  return prisma.$transaction(async (transaction) => {
    const submission = await transaction.propertySubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, ownerId: true, referenceNumber: true, status: true },
    });
    if (!submission) throw new Error("Submission not found.");
    assertSubmissionTransition(submission.status, "UNDER_REVIEW");
    const updated = await transaction.propertySubmission.update({
      where: { id: submissionId },
      data: {
        status: "UNDER_REVIEW",
        assignedReviewerId: reviewerId,
        version: { increment: 1 },
      },
      select: { id: true, referenceNumber: true, status: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: reviewerId,
        action: "SUBMISSION_START_REVIEW",
        entityType: "PropertySubmission",
        entityId: submissionId,
        summary: `${submission.referenceNumber} moved to review`,
      },
    });
    await transaction.notification.create({
      data: {
        recipientId: submission.ownerId,
        type: "SUBMISSION_UNDER_REVIEW",
        title: "Your submission is under review",
        body: `Your submission ${submission.referenceNumber} is now being reviewed.`,
        entityType: "PropertySubmission",
        entityId: submissionId,
      },
    });
    return updated;
  });
}

export function canPerformModeration(role: ProfileRole) {
  return role === "REVIEWER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function archiveSubmission(submissionId: string, actorId: string) {
  return prisma.$transaction(async (transaction) => {
    const submission = await transaction.propertySubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, ownerId: true, referenceNumber: true, status: true },
    });
    if (!submission) throw new Error("Submission not found.");
    assertSubmissionTransition(submission.status, "ARCHIVED");
    const updated = await transaction.propertySubmission.update({
      where: { id: submissionId },
      data: { status: "ARCHIVED", version: { increment: 1 } },
      select: { id: true, status: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "SUBMISSION_ARCHIVED",
        entityType: "PropertySubmission",
        entityId: submissionId,
        summary: `${submission.referenceNumber} archived`,
      },
    });
    await transaction.notification.create({
      data: {
        recipientId: submission.ownerId,
        type: "SUBMISSION_ARCHIVED",
        title: "Submission archived",
        body: `Your submission ${submission.referenceNumber} is now archived.`,
        entityType: "PropertySubmission",
        entityId: submissionId,
      },
    });
    return updated;
  });
}

export async function moderateSubmission(
  submissionId: string,
  reviewerId: string,
  action: ModerationAction,
  reason = "",
) {
  if (action === "START_REVIEW")
    return startSubmissionReview(submissionId, reviewerId);
  if ((action === "REQUEST_CHANGES" || action === "REJECT") && !reason.trim())
    throw new Error("Add a reason for this decision.");

  const result = await prisma.$transaction(async (transaction) => {
    const submission = await transaction.propertySubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        ownerId: true,
        referenceNumber: true,
        status: true,
        payload: true,
      },
    });
    if (!submission) throw new Error("Submission not found.");
    const target = targets[action];
    assertSubmissionTransition(submission.status, target);
    const payloadResult = submissionFinalSchema.safeParse(submission.payload);
    if (
      (action === "APPROVE" || action === "APPROVE_AND_PUBLISH") &&
      !payloadResult.success
    )
      throw new Error(
        "This submission needs complete details before approval.",
      );
    if (action === "APPROVE_AND_PUBLISH") {
      const mediaCount = await transaction.propertySubmissionMedia.count({
        where: { submissionId },
      });
      if (mediaCount < 1)
        throw new Error(
          "Add at least 1 preview image before publishing this property.",
        );
    }

    const updated = await transaction.propertySubmission.update({
      where: { id: submission.id },
      data: {
        status: target,
        reason: reason.trim() || null,
        reviewedAt: new Date(),
        assignedReviewerId: reviewerId,
        version: { increment: 1 },
      },
      select: { id: true, referenceNumber: true, status: true },
    });
    let propertyId: string | null = null;
    if (
      payloadResult.success &&
      (action === "APPROVE" || action === "APPROVE_AND_PUBLISH")
    ) {
      const payload = payloadResult.data;
      const published = action === "APPROVE_AND_PUBLISH";
      const propertyData = {
        ownerId: submission.ownerId,
        slug: toPropertySlug(payload.title, submission.referenceNumber),
        referenceNumber: submission.referenceNumber,
        title: payload.title,
        description: payload.description,
        intent: PropertyIntent[payload.intent],
        category: PropertyCategory[payload.category],
        status: published ? PropertyStatus.PUBLISHED : PropertyStatus.DRAFT,
        isModerated: true,
        priceMinor:
          payload.priceMinor && !payload.priceOnRequest
            ? BigInt(payload.priceMinor)
            : null,
        priceOnRequest: payload.priceOnRequest,
        isNegotiable: payload.isNegotiable,
        areaValue: payload.areaValue || null,
        areaUnit: payload.areaUnit || null,
        addressLine: payload.addressLine || null,
        localityName: payload.localityName,
        city: payload.city,
        state: payload.state,
        postalCode: payload.postalCode || null,
        bedrooms: payload.category === "PLOT" ? null : payload.bedrooms,
        bathrooms: payload.category === "PLOT" ? null : payload.bathrooms,
        floors: payload.floors,
        furnishing: payload.furnishing || null,
        possession: payload.possession || null,
        amenities: payload.amenities,
        highlights: payload.highlights,
        otherPropertyType:
          payload.category === "OTHER"
            ? payload.otherPropertyType || null
            : null,
        publishedAt: published ? new Date() : null,
      };
      const property = await transaction.property.upsert({
        where: { sourceSubmissionId: submission.id },
        create: { sourceSubmissionId: submission.id, ...propertyData },
        update: propertyData,
        select: { id: true },
      });
      propertyId = property.id;
    }

    await transaction.auditLog.create({
      data: {
        actorId: reviewerId,
        action: `SUBMISSION_${action}`,
        entityType: "PropertySubmission",
        entityId: submission.id,
        summary: `${submission.referenceNumber} marked ${target.toLowerCase().replace("_", " ")}`,
        metadata: { action, reason: reason.trim() || null },
      },
    });
    await transaction.notification.create({
      data: {
        recipientId: submission.ownerId,
        type: `SUBMISSION_${target}`,
        title:
          target === "NEEDS_CHANGES"
            ? "Changes requested on your submission"
            : target === "REJECTED"
              ? "Submission review complete"
              : "Submission approved",
        body:
          reason.trim() ||
          `Your submission ${submission.referenceNumber} has been updated.`,
        entityType: "PropertySubmission",
        entityId: submission.id,
      },
    });
    return { updated, propertyId };
  });
  if (action === "APPROVE_AND_PUBLISH" && result.propertyId)
    await publishSubmissionMedia(submissionId, result.propertyId);
  return result.updated;
}

async function publishSubmissionMedia(
  submissionId: string,
  propertyId: string,
) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Storage is not configured for publication.");
  const media = await prisma.propertySubmissionMedia.findMany({
    where: { submissionId },
    orderBy: { sortOrder: "asc" },
  });
  const copied: Array<{ source: string; target: string }> = [];
  try {
    for (const item of media) {
      const extension = item.storagePath.split(".").pop() ?? "jpg";
      const target = `${propertyId}/${item.id}.${extension}`;
      const copy = await admin.storage
        .from("property-submission-media")
        .copy(item.storagePath, target, {
          destinationBucket: "property-media",
        });
      if (copy.error) throw copy.error;
      copied.push({ source: item.storagePath, target });
    }
    await prisma.$transaction(async (transaction) => {
      for (const [index, item] of media.entries()) {
        await transaction.propertyMedia.create({
          data: {
            propertyId,
            storagePath: copied[index].target,
            altText: item.altText,
            sortOrder: item.sortOrder,
            isCover: index === 0,
            width: item.width,
            height: item.height,
          },
        });
      }
      await transaction.propertySubmissionMedia.deleteMany({
        where: { submissionId },
      });
    });
    await admin.storage
      .from("property-submission-media")
      .remove(media.map((item) => item.storagePath));
  } catch {
    if (copied.length > 0)
      await admin.storage
        .from("property-media")
        .remove(copied.map((item) => item.target));
    throw new Error("Property images could not be published.");
  }
}
