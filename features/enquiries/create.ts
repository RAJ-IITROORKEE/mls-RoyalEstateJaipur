import { createHash } from "node:crypto";
import { EnquiryType, PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { z } from "zod";
import type { enquirySchema } from "@/features/enquiries/schemas";

export async function createPublicEnquiry(
  input: z.infer<typeof enquirySchema>,
) {
  return prisma.$transaction(
    async (transaction) => {
      const property = input.propertyReference
        ? await transaction.property.findFirst({
            where: {
              referenceNumber: input.propertyReference,
              status: PropertyStatus.PUBLISHED,
            },
            select: { id: true },
          })
        : null;
      const email = input.email.toLowerCase();
      const digest = createHash("sha256")
        .update(JSON.stringify([email, input.message, property?.id ?? null]))
        .digest();
      const lockKey = digest.readBigInt64BE();
      // Transaction-scoped coordination also works through a pooled connection.
      await transaction.$queryRaw`SELECT pg_advisory_xact_lock(${lockKey})::text`;
      const duplicate = await transaction.enquiry.findFirst({
        where: {
          email,
          message: input.message,
          propertyId: property?.id ?? null,
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        },
        select: { id: true },
      });
      if (duplicate) return { duplicate: true };
      await transaction.enquiry.create({
        data: {
          contactName: input.contactName,
          email,
          phone: input.phone || null,
          message: input.message,
          propertyId: property?.id,
          type: property ? EnquiryType.PROPERTY : EnquiryType.GENERAL,
          consentAt: new Date(),
          source: "website",
        },
        select: { id: true },
      });
      return { duplicate: false };
    },
    { maxWait: 10000, timeout: 25000 },
  );
}
