"use client";

import {
  Bell,
  ChevronRight,
  History,
  LayoutDashboard,
  ListChecks,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/submissions", label: "Submissions", icon: ListChecks },
  { href: "/admin/properties", label: "Properties", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Bell },
  { href: "/admin/blog", label: "Blogs", icon: Newspaper },
  { href: "/admin/audit", label: "Audit history", icon: History },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = (
    <nav aria-label="Admin navigation" className="grid gap-1 p-3">
      {navigation.map(({ href, icon: Icon, label }) => (
        <Link
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
          href={href}
          key={href}
          onClick={() => setMobileOpen(false)}
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          {!collapsed && <span>{label}</span>}
        </Link>
      ))}
    </nav>
  );
  return (
    <div className="min-h-screen bg-background">
      <a className="skip-link" href="#admin-main">
        Skip to main content
      </a>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card transition-[width] duration-200 lg:flex lg:flex-col",
          collapsed ? "w-[76px]" : "w-[256px]",
        )}
      >
        <div
          className={cn(
            "flex h-18 items-center border-b border-border px-4",
            collapsed && "justify-center px-2",
          )}
        >
          <Link
            className="flex items-center gap-3 overflow-hidden"
            href="/admin"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
              RS
            </span>
            {!collapsed && (
              <span className="text-sm font-bold tracking-[0.12em]">
                ADMIN DASHBOARD
              </span>
            )}
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-border p-3">
          <Button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-full"
            onClick={() => setCollapsed((value) => !value)}
            variant="ghost"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <>
                <PanelLeftClose aria-hidden="true" className="size-4" />
                <span>Collapse sidebar</span>
              </>
            )}
          </Button>
        </div>
      </aside>
      <div
        className={cn(
          "transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[256px]",
        )}
      >
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              aria-label="Open admin navigation"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Menu aria-hidden="true" className="size-5" />
            </Button>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <Link href="/admin">Admin dashboard</Link>
              <ChevronRight aria-hidden="true" className="size-4" />
              <span className="font-semibold text-foreground">Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
              Foundation preview
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main
          className="mx-auto w-full max-w-[1600px] p-5 sm:p-8"
          id="admin-main"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-border bg-card shadow-xl">
            <div className="flex h-18 items-center justify-between border-b border-border px-4">
              <span className="text-sm font-bold tracking-[0.12em]">
                RS ADMIN DASHBOARD
              </span>
              <Button
                aria-label="Close admin navigation"
                onClick={() => setMobileOpen(false)}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </div>
            <div className="overflow-y-auto">{nav}</div>
          </aside>
        </div>
      )}
    </div>
  );
}
