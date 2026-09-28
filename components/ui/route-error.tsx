"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export function RouteError({
  error,
  reset,
  title = "This page could not be loaded.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  useEffect(() => {
    console.error("Route render failed", {
      digest: error.digest,
      name: error.name,
    });
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-7 text-center sm:p-10">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-6 font-serif text-4xl leading-tight">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
          The service may be temporarily unavailable. Retry the page, or return
          home and continue from there.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} type="button">
            <RotateCcw aria-hidden="true" className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home aria-hidden="true" className="size-4" />
              Return home
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
