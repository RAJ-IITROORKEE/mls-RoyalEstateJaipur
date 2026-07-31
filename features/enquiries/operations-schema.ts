import { z } from "zod";

import { enquiryStatuses } from "@/features/enquiries/transitions";

export const enquiryOperationSchema = z.object({
  status: z.enum(enquiryStatuses),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const enquiryAssignmentSchema = z.object({
  assignedAdminId: z.string().uuid().nullable(),
});
