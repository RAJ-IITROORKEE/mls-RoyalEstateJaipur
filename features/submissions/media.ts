import { z } from "zod";

export const submissionMediaMetadataSchema = z.object({
  altText: z.string().trim().min(3).max(180),
  width: z.coerce.number().int().min(1).max(20_000),
  height: z.coerce.number().int().min(1).max(20_000),
});

export const submissionMediaUpdateSchema = z.object({
  altText: z.string().trim().min(3).max(180).optional(),
  sortOrder: z.number().int().min(0).max(4).optional(),
  isCover: z.boolean().optional(),
});

export const submissionMediaTypes = ["image/jpeg", "image/png"] as const;
export const maxSubmissionMediaBytes = 10 * 1024 * 1024;
export const maxSubmissionMediaCount = 5;

export function getSubmissionMediaExtension(
  fileName: string,
  mimeType: string,
) {
  const extension = fileName.toLowerCase().split(".").pop();
  const allowed = mimeType === "image/jpeg" ? ["jpg", "jpeg"] : ["png"];
  return extension &&
    submissionMediaTypes.includes(
      mimeType as (typeof submissionMediaTypes)[number],
    ) &&
    allowed.includes(extension)
    ? extension
    : null;
}
