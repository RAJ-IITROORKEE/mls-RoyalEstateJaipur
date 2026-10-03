import type { Metadata, Viewport } from "next";
import { fontFamilyVariables } from "@/features/site-appearance/fonts";
import NextTopLoader from "nextjs-toploader";

import { ThemeProvider } from "@/components/theme-provider";
import { fontFamilyThemeClasses } from "@/features/site-appearance/font-family";
import { getPublicFontFamily } from "@/features/site-appearance/queries";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8faf9" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

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
      className={`${fontFamilyVariables[fontFamily]} ${fontFamilyThemeClasses[fontFamily]} h-full antialiased`}
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
