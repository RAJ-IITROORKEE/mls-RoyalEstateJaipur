import { z } from "zod";

export const enquirySchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10).max(3000),
  propertyReference: z.string().trim().max(32).optional(),
  consent: z.literal("on"),
  website: z.string().max(0),
});

export function getEnquiryFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
