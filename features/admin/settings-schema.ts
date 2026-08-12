import { z } from "zod";

import { editableSettingKeys } from "@/features/admin/settings";
import { fontFamilyValues } from "@/features/site-appearance/font-family";

export const settingsUpdateSchema = z.object({
  key: z.enum(editableSettingKeys),
  value: z.string().trim().max(320),
}).superRefine(({ key, value }, context) => {
  if (key === "business.email" && !z.string().email().safeParse(value).success) context.addIssue({ code: "custom", path: ["value"], message: "Enter a valid email." });
  if (key === "business.whatsapp" && !/^\d{8,15}$/.test(value)) context.addIssue({ code: "custom", path: ["value"], message: "Use digits only for WhatsApp." });
  if (key === "content.demoMode" && value !== "true" && value !== "false") context.addIssue({ code: "custom", path: ["value"], message: "Demo mode must be true or false." });
  if (key === "appearance.fontFamily" && !fontFamilyValues.includes(value as (typeof fontFamilyValues)[number])) context.addIssue({ code: "custom", path: ["value"], message: "Choose a supported font family." });
});
