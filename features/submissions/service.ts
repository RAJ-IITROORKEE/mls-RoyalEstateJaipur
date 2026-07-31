import {
  Prisma,
  type ProfileRole,
  type SubmissionStatus,
} from "@prisma/client";

import { createSubmissionReference } from "@/features/submissions/references";
import {
  getSubmittedStatus,
  assertSubmissionTransition,
} from "@/features/submissions/transitions";
import {
  type SubmissionDraft,
  submissionFinalSchema,
  submissionMutationSchema,
} from "@/features/submissions/schemas";
import { prisma } from "@/lib/db/prisma";

function toJsonPayload(payload: SubmissionDraft): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue;
}

function getSubmissionFields(payload: SubmissionDraft) {
  return {
    intent: payload.intent,
    category: payload.category,
    payload: toJsonPayload(payload),
  };
}

export type SubmissionMutationInput = {
  action: "SAVE_DRAFT" | "SUBMIT";
  submissionId?: string;
  payload: SubmissionDraft;
};

export function isRetryableSubmissionTransactionError(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2028") ||
    (error instanceof Error && error.message.includes("Transaction not found"))
  );
}

export async function saveOrSubmitOwnerSubmission(
  ownerId: string,
  input: SubmissionMutationInput,
) {
  const validated = submissionMutationSchema.safeParse(input);
  if (!validated.success) throw new Error("The submission data is invalid.");
  if (validated.data.action === "SUBMIT") {
    const final = submissionFinalSchema.safeParse(validated.data.payload);
    if (!final.success)
      throw new Error(
        final.error.issues[0]?.message ??
          "Complete the required submission fields.",
      );
  }

  const fields = getSubmissionFields(validated.data.payload);
  if (validated.data.action === "SAVE_DRAFT") {
    if (!validated.data.submissionId)
      return prisma.propertySubmission.create({
        data: {
          ownerId,
          referenceNumber: createSubmissionReference(),
          ...fields,
        },
        select: { id: true, referenceNumber: true, status: true },
      });

    const updated = await prisma.propertySubmission.updateMany({
      where: {
        id: validated.data.submissionId,
        ownerId,
        status: { in: ["DRAFT", "NEEDS_CHANGES"] },
      },
      data: { ...fields, version: { increment: 1 } },
    });
    if (updated.count === 0) {
      const existing = await prisma.propertySubmission.findFirst({
        where: { id: validated.data.submissionId, ownerId },
        select: { status: true },
      });
      if (!existing) throw new Error("Submission not found.");
      throw new Error("This submission can no longer be edited.");
    }
    const saved = await prisma.propertySubmission.findFirst({
      where: { id: validated.data.submissionId, ownerId },
      select: { id: true, referenceNumber: true, status: true },
    });
    if (!saved) throw new Error("Submission not found.");
    return saved;
  }

  const submit = () =>
    prisma.$transaction(
      async (transaction) => {
        const existing = validated.data.submissionId
          ? await transaction.propertySubmission.findFirst({
              where: { id: validated.data.submissionId, ownerId },
              select: { id: true, referenceNumber: true, status: true },
            })
          : null;
        if (validated.data.submissionId && !existing)
          throw new Error("Submission not found.");
        if (existing && !["DRAFT", "NEEDS_CHANGES"].includes(existing.status))
          throw new Error("This submission can no longer be edited.");

        const submission = existing
          ? await transaction.propertySubmission.update({
              where: { id: existing.id },
              data: { ...fields, version: { increment: 1 } },
              select: { id: true, referenceNumber: true, status: true },
            })
          : await transaction.propertySubmission.create({
              data: {
                ownerId,
                referenceNumber: createSubmissionReference(),
                ...fields,
              },
              select: { id: true, referenceNumber: true, status: true },
            });
        const previewImageCount =
          await transaction.propertySubmissionMedia.count({
            where: { submissionId: submission.id },
          });
        if (previewImageCount < 1)
          throw new Error("Add at least 1 preview image before submitting.");

        const nextStatus = getSubmittedStatus(
          submission.status as SubmissionStatus,
        );
        assertSubmissionTransition(
          submission.status as SubmissionStatus,
          nextStatus,
        );
        const submitted = await transaction.propertySubmission.update({
          where: { id: submission.id },
          data: {
            status: nextStatus,
            submittedAt: new Date(),
            reason: null,
            version: { increment: 1 },
          },
          select: { id: true, referenceNumber: true, status: true },
        });
        await transaction.auditLog.create({
          data: {
            actorId: ownerId,
            action: "SUBMISSION_SUBMITTED",
            entityType: "PropertySubmission",
            entityId: submission.id,
            summary: `Owner submitted ${submission.referenceNumber}`,
          },
        });

        const recipients = await transaction.profile.findMany({
          where: {
            role: { in: ["REVIEWER", "ADMIN", "SUPER_ADMIN"] },
            status: "ACTIVE",
          },
          select: { id: true },
        });
        if (recipients.length > 0)
          await transaction.notification.createMany({
            data: recipients.map(({ id }) => ({
              recipientId: id,
              type: "SUBMISSION_SUBMITTED",
              title: "Submission ready for review",
              body: `${submission.referenceNumber} is ready for moderation.`,
              entityType: "PropertySubmission",
              entityId: submission.id,
            })),
          });
        return submitted;
      },
      { maxWait: 10_000, timeout: 20_000 },
    );

  try {
    return await submit();
  } catch (error) {
    if (isRetryableSubmissionTransactionError(error)) return submit();
    throw error;
  }
}

export async function getOwnerSubmissions(ownerId: string) {
  return prisma.propertySubmission.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      referenceNumber: true,
      intent: true,
      category: true,
      status: true,
      reason: true,
      submittedAt: true,
      updatedAt: true,
    },
  });
}

export async function getOwnerSubmission(
  ownerId: string,
  submissionId: string,
) {
  return prisma.propertySubmission.findFirst({
    where: { id: submissionId, ownerId },
    select: {
      id: true,
      referenceNumber: true,
      intent: true,
      category: true,
      status: true,
      payload: true,
      reason: true,
      submittedAt: true,
      updatedAt: true,
      createdAt: true,
    },
  });
}

export function canEditOwnerSubmission(status: SubmissionStatus) {
  return status === "DRAFT" || status === "NEEDS_CHANGES";
}

export function canReviewAsStaff(role: ProfileRole) {
  return role === "REVIEWER" || role === "ADMIN" || role === "SUPER_ADMIN";
}
