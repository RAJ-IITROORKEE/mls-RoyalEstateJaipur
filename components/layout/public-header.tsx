"use client";

import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  ["Properties", "/properties"],
  ["Blogs", "/blogs"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export function PublicHeader({
  businessName,
  user,
}: {
  businessName: string;
  user?: {
    displayName: string | null;
    email: string;
    avatarUrl: string | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[1360px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <span
            className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-accent"
          >
            <Image
              alt={businessName}
              className="object-cover"
              fill
              sizes="40px"
              src="/logo.jpeg"
            />
          </span>
          <span className="truncate text-sm font-bold tracking-[0.16em] text-foreground">
            {businessName}
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {links.map(([label, href]) => (
            <Link
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <div className="relative hidden sm:block">
              <button
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-2 pr-3 text-sm font-semibold hover:bg-muted"
                onClick={() => setAccountOpen((value) => !value)}
                type="button"
              >
                <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-primary text-xs text-primary-foreground">
                  {user.avatarUrl ? (
                    <Image
                      alt=""
                      className="size-full object-cover"
                      height={32}
                      src={user.avatarUrl}
                      width={32}
                    />
                  ) : (
                    <span>
                      {(user.displayName ?? user.email)
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                  )}
                </span>
                <ChevronDown aria-hidden="true" className="size-4" />
              </button>
              {accountOpen && (
                <div
                  className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl"
                  role="menu"
                >
                  <div className="border-b border-border px-3 py-3">
                    <p className="truncate text-sm font-bold">
                      {user.displayName || "Your account"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    className="mt-2 block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-muted"
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-muted"
                    href="/account/settings"
                    onClick={() => setAccountOpen(false)}
                  >
                    Settings
                  </Link>
                  <form action="/api/auth/sign-out" method="post">
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"
                      type="submit"
                    >
                      <LogOut aria-hidden="true" className="size-4" /> Log out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              className="hidden min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted sm:inline-flex"
              href="/sign-in"
            >
              Sign in
            </Link>
          )}
          {!user && (
            <Link
              className="hidden min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:inline-flex"
              href="/list-property"
            >
              List your property
            </Link>
          )}
          <Button
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="lg:hidden"
            onClick={() => setOpen((value) => !value)}
            size="icon"
            variant="ghost"
          >
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </Button>
        </div>
      </div>
      <div
        className={cn(
          "border-t border-border bg-card lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          aria-label="Mobile navigation"
          className="mx-auto grid max-w-[1360px] gap-1 px-5 py-4 sm:px-8"
        >
          {links.map(([label, href]) => (
            <Link
              className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-muted"
              href={href}
              key={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                className="mt-2 rounded-xl bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
                href="/account"
              >
                Open dashboard
              </Link>
              <Link
                className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-muted"
                href="/account/settings"
              >
                Settings
              </Link>
              <form action="/api/auth/sign-out" method="post">
                <button
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-destructive"
                  type="submit"
                >
                  <LogOut aria-hidden="true" className="size-4" /> Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              className="mt-2 rounded-xl bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
              href="/sign-in"
            >
              Sign in to track a listing
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
