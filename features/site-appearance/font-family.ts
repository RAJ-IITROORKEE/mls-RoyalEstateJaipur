export const fontFamilyValues = [
  "current",
  "dm-serif",
  "playfair",
  "lora",
  "fraunces",
] as const;

export type FontFamily = (typeof fontFamilyValues)[number];

export const defaultFontFamily: FontFamily = "current";

export const fontFamilyOptions = [
  {
    value: "current",
    label: "Current: Manrope + Cormorant Garamond",
    description: "Clean interface text with classic editorial headings.",
  },
  {
    value: "dm-serif",
    label: "Modern editorial: DM Sans + DM Serif Display",
    description: "Balanced, refined, and easy to scan across listings.",
  },
  {
    value: "playfair",
    label: "Premium classic: Plus Jakarta Sans + Playfair Display",
    description: "A polished contrast for premium residential storytelling.",
  },
  {
    value: "lora",
    label: "Warm contemporary: Outfit + Lora",
    description: "Approachable body text with calm, literary display type.",
  },
  {
    value: "fraunces",
    label: "Architectural: Figtree + Fraunces",
    description: "A distinctive, confident pairing with modern clarity.",
  },
] as const satisfies ReadonlyArray<{
  value: FontFamily;
  label: string;
  description: string;
}>;

export const fontFamilyThemeClasses: Record<FontFamily, string> = {
  current: "font-theme-current",
  "dm-serif": "font-theme-dm-serif",
  playfair: "font-theme-playfair",
  lora: "font-theme-lora",
  fraunces: "font-theme-fraunces",
};

export function parseFontFamily(value: unknown): FontFamily {
  return typeof value === "string" && fontFamilyValues.includes(value as FontFamily)
    ? value as FontFamily
    : defaultFontFamily;
}
