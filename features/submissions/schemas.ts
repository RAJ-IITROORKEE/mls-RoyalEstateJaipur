import { z } from "zod";

export const submissionIntents = ["SELL", "RENT", "LEASE"] as const;
export const submissionCategories = [
  "PLOT",
  "RESIDENTIAL",
  "COMMERCIAL",
  "INDUSTRIAL",
  "AGRICULTURAL",
  "OTHER",
] as const;
export const areaUnits = [
  "SQ_FT",
  "SQ_YD",
  "SQ_M",
  "ACRE",
  "HECTARE",
  "BIGHA",
] as const;

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));
const optionalInteger = z.number().int().min(0).max(1000).optional().nullable();

export const submissionDraftSchema = z.object({
  intent: z.enum(submissionIntents),
  category: z.enum(submissionCategories),
  otherPropertyType: optionalText(100),
  title: z.string().trim().max(180),
  description: z.string().trim().max(5000),
  localityName: z.string().trim().max(120),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
  postalCode: optionalText(12),
  addressLine: optionalText(240),
  priceMinor: z.string().regex(/^\d+$/).max(18).optional().or(z.literal("")),
  priceOnRequest: z.boolean(),
  isNegotiable: z.boolean(),
  areaValue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .max(14)
    .optional()
    .or(z.literal("")),
  areaUnit: z.enum(areaUnits).optional(),
  bedrooms: optionalInteger,
  bathrooms: optionalInteger,
  floors: optionalInteger,
  furnishing: optionalText(40),
  possession: optionalText(120),
  amenities: z.array(z.string().trim().min(1).max(80)).max(30),
  highlights: z.array(z.string().trim().min(1).max(180)).max(12),
  ownerPhone: optionalText(30),
  consent: z.boolean(),
});

export const submissionFinalSchema = submissionDraftSchema.superRefine(
  (value, context) => {
    const requiredFields: Array<[keyof typeof value, string]> = [
      ["title", "Add a listing title."],
      ["description", "Add a useful description."],
      ["localityName", "Add a locality."],
      ["city", "Add a city."],
      ["state", "Add a state."],
    ];
    for (const [field, message] of requiredFields) {
      if (!value[field] || typeof value[field] !== "string")
        context.addIssue({ code: "custom", path: [field], message });
    }
    if (!value.consent)
      context.addIssue({
        code: "custom",
        path: ["consent"],
        message: "Consent is required before submitting.",
      });
    if (
      value.category === "PLOT" &&
      (value.bedrooms !== null || value.bathrooms !== null)
    )
      context.addIssue({
        code: "custom",
        path: ["category"],
        message: "Plots do not use bedroom or bathroom fields.",
      });
    if (value.category === "OTHER" && !value.otherPropertyType?.trim())
      context.addIssue({
        code: "custom",
        path: ["otherPropertyType"],
        message: "Specify the property type.",
      });
  },
);

export const submissionMutationSchema = z.object({
  action: z.enum(["SAVE_DRAFT", "SUBMIT"]),
  submissionId: z.string().uuid().optional().or(z.literal("")),
  payload: submissionDraftSchema,
});

export const moderationActionSchema = z.object({
  action: z.enum([
    "START_REVIEW",
    "REQUEST_CHANGES",
    "REJECT",
    "APPROVE",
    "APPROVE_AND_PUBLISH",
  ]),
  reason: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type SubmissionDraft = z.infer<typeof submissionDraftSchema>;
