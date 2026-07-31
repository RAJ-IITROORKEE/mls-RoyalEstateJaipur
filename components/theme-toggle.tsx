"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  if (!mounted) return <Button aria-label="Choose theme" size="icon" variant="ghost"><Monitor aria-hidden="true" className="size-4" /></Button>;
  const isDark = resolvedTheme === "dark";
  return <Button aria-label={`Switch to ${isDark ? "light" : "dark"} theme`} onClick={() => setTheme(isDark ? "light" : "dark")} size="icon" variant="ghost">{isDark ? <Sun aria-hidden="true" className="size-4" /> : <Moon aria-hidden="true" className="size-4" />}</Button>;
}
