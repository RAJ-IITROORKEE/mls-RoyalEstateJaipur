import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { ThemeProvider } from "@/components/theme-provider";
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "RoyaleStateJaipur | Property, considered",
    template: "%s | RoyaleStateJaipur",
  },
  description:
    "A considered way to discover and present property across Jaipur.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
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
