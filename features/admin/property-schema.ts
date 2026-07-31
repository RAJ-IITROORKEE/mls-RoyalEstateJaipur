import { z } from "zod";

import {
  propertyCategories,
  propertyIntents,
  propertyStatuses,
} from "@/features/properties/domain";

const optionalShortText = z.string().trim().max(180);
const optionalCount = z.union([z.literal(""), z.string().regex(/^\d{1,3}$/)]);

export const propertyStatusUpdateSchema = z.object({
  kind: z.literal("status"),
  status: z.enum(propertyStatuses),
});

export const propertyFeaturedUpdateSchema = z.object({
  kind: z.literal("featured"),
  isFeatured: z.boolean(),
  featuredRank: z.number().int().min(1).max(100).nullable().optional(),
});

export const propertyDetailsUpdateSchema = z
  .object({
    kind: z.literal("details"),
    title: z.string().trim().min(5).max(180),
    description: z.string().trim().min(20).max(10_000),
    intent: z.enum(propertyIntents),
    category: z.enum(propertyCategories),
    otherPropertyType: optionalShortText,
    priceRupees: z.union([z.literal(""), z.string().regex(/^\d{1,16}$/)]),
    priceOnRequest: z.boolean(),
    isNegotiable: z.boolean(),
    areaValue: z.union([
      z.literal(""),
      z.string().regex(/^\d{1,11}(?:\.\d{1,2})?$/),
    ]),
    areaUnit: z.string().trim().max(20),
    addressLine: z.string().trim().max(500),
    localityName: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postalCode: z.union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(/^\d{6}$/),
    ]),
    bedrooms: optionalCount,
    bathrooms: optionalCount,
    floors: optionalCount,
    furnishing: z.string().trim().max(40),
    possession: z.string().trim().max(120),
    amenities: z.array(z.string().trim().min(1).max(80)).max(40),
    highlights: z.array(z.string().trim().min(1).max(180)).max(20),
    seoTitle: z.string().trim().max(180),
    seoDescription: z.string().trim().max(320),
  })
  .superRefine((value, context) => {
    if (value.category === "OTHER" && value.otherPropertyType.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["otherPropertyType"],
        message: "Specify the property type.",
      });
    }
    if (!value.priceOnRequest && value.priceRupees === "") {
      context.addIssue({
        code: "custom",
        path: ["priceRupees"],
        message: "Add a price or mark it on request.",
      });
    }
  });

export const propertyAdminMutationSchema = z.discriminatedUnion("kind", [
  propertyStatusUpdateSchema,
  propertyFeaturedUpdateSchema,
  propertyDetailsUpdateSchema,
]);

export type PropertyDetailsUpdate = z.infer<typeof propertyDetailsUpdateSchema>;
