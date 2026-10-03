import {
  DM_Sans,
  DM_Serif_Display,
  Figtree,
  Fraunces,
  Lora,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";

import type { FontFamily } from "./font-family";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Only the chosen variables apply globally. Alternate pairs download when an
// administrator explicitly previews or selects them; the default is preloaded.
export const fontFamilyVariables: Record<FontFamily, string> = {
  current: plusJakarta.variable,
  "dm-serif": `${dmSans.variable} ${dmSerif.variable}`,
  playfair: `${plusJakarta.variable} ${playfair.variable}`,
  lora: `${outfit.variable} ${lora.variable}`,
  fraunces: `${figtree.variable} ${fraunces.variable}`,
};
