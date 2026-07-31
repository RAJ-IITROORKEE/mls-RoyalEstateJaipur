import { z } from "zod";

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30),
});
