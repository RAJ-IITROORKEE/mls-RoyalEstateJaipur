import { unstable_cache } from "next/cache";

import {
  defaultFontFamily,
  parseFontFamily,
} from "@/features/site-appearance/font-family";
import { prisma } from "@/lib/db/prisma";

const getCachedPublicFontFamily = unstable_cache(
  async () => {
    const setting = await prisma.siteSetting.findFirst({
      where: { key: "appearance.fontFamily", isPublic: true },
      select: { value: true },
    });
    return parseFontFamily(setting?.value);
  },
  ["site-font-family"],
  { tags: ["site-font-family"] },
);

export async function getPublicFontFamily() {
  try {
    return await getCachedPublicFontFamily();
  } catch {
    return defaultFontFamily;
  }
}
