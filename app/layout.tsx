import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Figtree,
  Fraunces,
  Lora,
  Manrope,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { ThemeProvider } from "@/components/theme-provider";
import { fontFamilyThemeClasses } from "@/features/site-appearance/font-family";
import { getPublicFontFamily } from "@/features/site-appearance/queries";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
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

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Royal Estates Jaipur | Property, considered",
    template: "%s | Royal Estates Jaipur",
  },
  description:
    "A considered way to discover and present property across Jaipur.",
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontFamily = await getPublicFontFamily();

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cormorant.variable} ${dmSans.variable} ${dmSerif.variable} ${plusJakarta.variable} ${playfair.variable} ${outfit.variable} ${lora.variable} ${figtree.variable} ${fraunces.variable} ${fontFamilyThemeClasses[fontFamily]} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <NextTopLoader
            color="var(--primary)"
            height={3}
            shadow="0 0 10px color-mix(in oklab, var(--primary) 45%, transparent)"
            showSpinner={false}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
