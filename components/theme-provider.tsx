"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

function BrowserThemeColor() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (!resolvedTheme) return;
    const synchronize = () => {
      const background = getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();
      if (!background) return;
      for (const meta of document.querySelectorAll<HTMLMetaElement>(
        'meta[name="theme-color"]',
      )) {
        meta.content = background;
      }
    };
    // next-themes applies the root class independently of React's render.
    const observer = new MutationObserver(synchronize);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    synchronize();
    return () => observer.disconnect();
  }, [resolvedTheme]);
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <BrowserThemeColor />
      {children}
    </NextThemesProvider>
  );
}
