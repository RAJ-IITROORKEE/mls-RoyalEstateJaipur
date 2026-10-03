"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const selectedTheme = mounted ? (theme ?? "system") : "system";
  const ThemeIcon =
    selectedTheme === "dark" ? Moon : selectedTheme === "light" ? Sun : Monitor;

  return (
    <label
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-foreground transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      <ThemeIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
      <span className="sr-only">Color theme</span>
      <select
        aria-label="Color theme"
        className="min-h-10 cursor-pointer appearance-none bg-transparent pr-1 text-sm outline-none"
        disabled={!mounted}
        onChange={(event) => setTheme(event.currentTarget.value)}
        value={selectedTheme}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
