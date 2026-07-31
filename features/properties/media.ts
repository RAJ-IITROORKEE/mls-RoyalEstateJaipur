import { z } from "zod";

export const mediaUploadSchema = z.object({
  altText: z.string().trim().min(3).max(180),
});

export const mediaUpdateSchema = z.object({
  mediaId: z.string().uuid(),
  altText: z.string().trim().min(3).max(180),
  sortOrder: z.number().int().min(0).max(999),
  isCover: z.boolean(),
});

export const mediaTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxMediaBytes = 10 * 1024 * 1024;

export function getSafeMediaExtension(fileName: string, mimeType: string) {
  const extension = fileName.toLowerCase().split(".").pop();
  const extensions: Record<(typeof mediaTypes)[number], string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
  };
  return extension &&
    mediaTypes.includes(mimeType as (typeof mediaTypes)[number]) &&
    extensions[mimeType as (typeof mediaTypes)[number]].includes(extension)
    ? extension
    : null;
}
