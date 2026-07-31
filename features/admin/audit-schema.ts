import { z } from "zod";

export const auditArchiveSchema = z.object({
  auditLogId: z.string().uuid(),
  reason: z.string().trim().min(3).max(500),
});
