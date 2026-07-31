import { z } from "zod";

export const documentUploadSchema = z.object({
  documentType: z.string().trim().min(2).max(60),
});

export const allowedDocumentTypes = ["application/pdf", "image/jpeg", "image/png"] as const;
export const maxDocumentBytes = 10 * 1024 * 1024;

export function getSafeDocumentExtension(fileName: string, mimeType: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (mimeType === "application/pdf" && extension === "pdf") return "pdf";
  if (mimeType === "image/jpeg" && (extension === "jpg" || extension === "jpeg")) return "jpg";
  if (mimeType === "image/png" && extension === "png") return "png";
  return null;
}
