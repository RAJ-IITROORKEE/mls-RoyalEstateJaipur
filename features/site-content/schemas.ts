import { z } from "zod";

const sortOrder = z.number().int().min(0).max(10_000);

export const faqInputSchema = z.object({
  question: z.string().trim().min(8).max(240),
  answer: z.string().trim().min(12).max(2000),
  sortOrder,
  isPublished: z.boolean(),
});

export const localityInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  sortOrder,
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export type FaqInput = z.infer<typeof faqInputSchema>;
export type LocalityInput = z.infer<typeof localityInputSchema>;
