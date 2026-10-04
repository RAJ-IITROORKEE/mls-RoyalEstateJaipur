import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import type { FaqInput, LocalityInput } from "@/features/site-content/schemas";
import { prisma } from "@/lib/db/prisma";

async function requireContentManager(
  transaction: Prisma.TransactionClient,
  actorId: string,
) {
  const actor = await transaction.profile.findUnique({
    where: { id: actorId },
    select: { role: true, status: true },
  });
  if (
    actor?.status !== "ACTIVE" ||
    (actor.role !== "ADMIN" && actor.role !== "SUPER_ADMIN")
  ) {
    throw new Error("Active administrator access is required.");
  }
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

async function uniqueLocalitySlug(
  transaction: Prisma.TransactionClient,
  name: string,
  excludeId?: string,
) {
  const base = toSlug(name) || "locality";
  let slug = base;
  let suffix = 2;
  while (
    await transaction.locality.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base.slice(0, 94)}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function createFaqItem(actorId: string, input: FaqInput) {
  return prisma.$transaction(async (transaction) => {
    await requireContentManager(transaction, actorId);
    const faq = await transaction.faqItem.create({
      data: {
        key: `${toSlug(input.question).slice(0, 80) || "faq"}-${randomUUID().slice(0, 8)}`,
        ...input,
      },
      select: { id: true, question: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "FAQ_CREATED",
        entityType: "FaqItem",
        entityId: faq.id,
        summary: `Created FAQ: ${faq.question}`,
      },
    });
    return faq;
  });
}

export async function updateFaqItem(
  actorId: string,
  faqId: string,
  input: FaqInput,
) {
  return prisma.$transaction(async (transaction) => {
    await requireContentManager(transaction, actorId);
    const previous = await transaction.faqItem.findUnique({
      where: { id: faqId },
      select: { id: true, question: true, isPublished: true, sortOrder: true },
    });
    if (!previous) throw new Error("FAQ entry not found.");
    const faq = await transaction.faqItem.update({
      where: { id: faqId },
      data: input,
      select: { id: true, question: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "FAQ_UPDATED",
        entityType: "FaqItem",
        entityId: faq.id,
        summary: `Updated FAQ: ${faq.question}`,
        metadata: {
          previousPublished: previous.isPublished,
          nextPublished: input.isPublished,
          previousSortOrder: previous.sortOrder,
          nextSortOrder: input.sortOrder,
        },
      },
    });
    return faq;
  });
}

export async function deleteFaqItem(actorId: string, faqId: string) {
  return prisma.$transaction(async (transaction) => {
    await requireContentManager(transaction, actorId);
    const faq = await transaction.faqItem.findUnique({
      where: { id: faqId },
      select: { id: true, question: true },
    });
    if (!faq) throw new Error("FAQ entry not found.");
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "FAQ_DELETED",
        entityType: "FaqItem",
        entityId: faq.id,
        summary: `Deleted FAQ: ${faq.question}`,
      },
    });
    await transaction.faqItem.delete({ where: { id: faq.id } });
  });
}

export async function createLocality(actorId: string, input: LocalityInput) {
  return prisma.$transaction(async (transaction) => {
    await requireContentManager(transaction, actorId);
    const locality = await transaction.locality.create({
      data: {
        ...input,
        slug: await uniqueLocalitySlug(transaction, input.name),
        summary: "",
      },
      select: { id: true, name: true, slug: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "LOCALITY_CREATED",
        entityType: "Locality",
        entityId: locality.id,
        summary: `Created locality: ${locality.name}`,
      },
    });
    return locality;
  });
}

export async function updateLocality(
  actorId: string,
  localityId: string,
  input: LocalityInput,
) {
  return prisma.$transaction(async (transaction) => {
    await requireContentManager(transaction, actorId);
    const previous = await transaction.locality.findUnique({
      where: { id: localityId },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        isActive: true,
        isFeatured: true,
        sortOrder: true,
      },
    });
    if (!previous) throw new Error("Locality not found.");
    const slug =
      previous.name === input.name
        ? undefined
        : await uniqueLocalitySlug(transaction, input.name, localityId);
    const locality = await transaction.locality.update({
      where: { id: localityId },
      data: { ...input, ...(slug ? { slug } : {}) },
      select: { id: true, name: true, city: true, state: true, slug: true },
    });
    if (
      previous.name !== input.name ||
      previous.city !== input.city ||
      previous.state !== input.state
    ) {
      await transaction.property.updateMany({
        where: { localityId },
        data: {
          localityName: input.name,
          city: input.city,
          state: input.state,
        },
      });
    }
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "LOCALITY_UPDATED",
        entityType: "Locality",
        entityId: locality.id,
        summary: `Updated locality: ${locality.name}`,
        metadata: {
          previousName: previous.name,
          nextName: input.name,
          previousActive: previous.isActive,
          nextActive: input.isActive,
          previousFeatured: previous.isFeatured,
          nextFeatured: input.isFeatured,
          previousSortOrder: previous.sortOrder,
          nextSortOrder: input.sortOrder,
        },
      },
    });
    return locality;
  });
}

export class ReferencedLocalityError extends Error {
  constructor() {
    super("This location is linked to properties. Make it inactive instead.");
  }
}

export async function deleteLocality(actorId: string, localityId: string) {
  return prisma.$transaction(
    async (transaction) => {
      await requireContentManager(transaction, actorId);
      // The row lock also blocks new FK references until this deletion commits.
      await transaction.$queryRaw`SELECT id FROM "Locality" WHERE id = ${localityId}::uuid FOR UPDATE`;
      const previous = await transaction.locality.findUnique({
        where: { id: localityId },
        select: { id: true, name: true, isActive: true },
      });
      if (!previous) throw new Error("Locality not found.");
      if (await transaction.property.count({ where: { localityId } }))
        throw new ReferencedLocalityError();
      await transaction.auditLog.create({
        data: {
          actorId,
          action: "LOCALITY_DELETED",
          entityType: "Locality",
          entityId: previous.id,
          summary: `Deleted locality: ${previous.name}`,
          metadata: { previousActive: previous.isActive },
        },
      });
      await transaction.locality.delete({ where: { id: localityId } });
    },
    // Remote pooled reads plus the FK lock can exceed Prisma's five-second default.
    { timeout: 15_000 },
  );
}
