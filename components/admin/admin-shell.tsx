"use client";

import {
  Bell,
  BookOpenText,
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/submissions", label: "Submissions", icon: ListChecks },
  { href: "/admin/properties", label: "Properties", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Bell },
  { href: "/admin/blog", label: "Blogs", icon: Newspaper },
  { href: "/admin/content", label: "FAQs", icon: BookOpenText },
  { href: "/admin/audit", label: "Audit history", icon: History },
];

type AdminUser = { name: string; role: string; avatarUrl: string | null };

function AdminBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      aria-label="Royal Estates Jaipur admin dashboard"
      className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg"
      href="/admin"
    >
      <Image
        alt=""
        className="shrink-0 rounded-full"
        height={40}
        width={40}
        src="/logo.jpeg"
      />
      {!compact && (
        <span className="min-w-0 text-sm font-bold leading-5">
          Royal Estates
          <span className="block text-xs font-medium text-muted-foreground">
            Admin workspace
          </span>
        </span>
      )}
    </Link>
  );
}

function AdminProfile({
  user,
  compact,
}: {
  user: AdminUser | null;
  compact: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const name = user?.name || "Setup workspace";
  return (
    <Link
      aria-label={`Account settings for ${name}`}
      title={compact ? name : undefined}
      href="/account/settings"
      className={cn(
        "flex min-h-14 min-w-0 items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted",
        compact && "justify-center px-0",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-sm font-bold">
        {user?.avatarUrl && user.avatarUrl !== failedUrl ? (
          <Image
            alt=""
            className="size-full object-cover"
            height={40}
            width={40}
            src={user.avatarUrl}
            onError={() => setFailedUrl(user.avatarUrl)}
          />
        ) : (
          name.slice(0, 1).toUpperCase()
        )}
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{name}</span>
          <span className="block text-xs capitalize text-muted-foreground">
            {user?.role || "Configuration required"}
          </span>
        </span>
      )}
    </Link>
  );
}

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AdminUser | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  const context = pathname.startsWith("/admin/settings")
    ? "Settings"
    : navigation.find(({ href }) => isActive(href))?.label || "Workspace";

  function renderNavigation(compact: boolean) {
    return (
      <nav aria-label="Admin navigation" className="grid gap-1 p-3">
        {navigation.map(({ href, icon: Icon, label }) => (
          <Link
            aria-current={isActive(href) ? "page" : undefined}
            aria-label={label}
            title={compact ? label : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              isActive(href) && "bg-accent text-accent-foreground",
              compact && "justify-center px-0",
            )}
            href={href}
            key={href}
            onClick={() => setMobileOpen(false)}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {!compact && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    );
  }

  function renderFooter(compact: boolean) {
    return (
      <div className="grid gap-2 border-t border-border p-3">
        <Link
          aria-label="Settings"
          title={compact ? "Settings" : undefined}
          aria-current={isActive("/admin/settings") ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-muted",
            isActive("/admin/settings") && "bg-accent text-accent-foreground",
            compact && "justify-center px-0",
          )}
          href="/admin/settings"
          onClick={() => setMobileOpen(false)}
        >
          <Settings aria-hidden="true" className="size-4" />
          {!compact && "Settings"}
        </Link>
        <AdminProfile user={user} compact={compact} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <a className="skip-link" href="#admin-main">
        Skip to main content
      </a>
      <aside
        aria-label="Admin sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card lg:flex",
          collapsed ? "w-[76px]" : "w-[256px]",
        )}
      >
        <div
          className={cn(
            "flex h-18 items-center border-b border-border px-4",
            collapsed && "justify-center px-2",
          )}
        >
          <AdminBrand compact={collapsed} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {renderNavigation(collapsed)}
        </div>
        {renderFooter(collapsed)}
      </aside>
      <div
        className={cn(
          "flex min-h-screen min-w-0 flex-col",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[256px]",
        )}
      >
        <header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-8">
          <Button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="hidden lg:inline-flex"
            onClick={() => setCollapsed((value) => !value)}
            size="icon"
            variant="ghost"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" />
            ) : (
              <PanelLeftClose aria-hidden="true" />
            )}
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                aria-label="Open admin navigation"
                className="lg:hidden"
                size="icon"
                variant="ghost"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(90vw,320px)] gap-0 p-0">
              <SheetHeader className="min-h-18 border-b border-border pr-14">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate the admin workspace and account settings.
                </SheetDescription>
                <AdminBrand />
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {renderNavigation(false)}
              </div>
              {renderFooter(false)}
            </SheetContent>
          </Sheet>
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
          >
            <Link className="hidden sm:inline" href="/admin">
              Admin dashboard
            </Link>
            <ChevronRight
              aria-hidden="true"
              className="hidden size-4 sm:block"
            />
            <span className="truncate font-semibold text-foreground">
              {context}
            </span>
          </nav>
        </header>
        <main
          className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 p-5 sm:p-8"
          id="admin-main"
          tabIndex={-1}
        >
          {children}
        </main>
        <footer className="border-t border-border px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-[1600px] justify-end">
            <ThemeToggle />
          </div>
        </footer>
      </div>
    </div>
  );
}
