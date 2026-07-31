import { ProfileRole, ProfileStatus } from "@prisma/client";
import { z } from "zod";

export const profileAccessSchema = z.object({
  profileId: z.string().uuid(),
  role: z.enum([ProfileRole.USER, ProfileRole.REVIEWER, ProfileRole.ADMIN, ProfileRole.SUPER_ADMIN]),
  status: z.enum([ProfileStatus.ACTIVE, ProfileStatus.SUSPENDED]),
});
