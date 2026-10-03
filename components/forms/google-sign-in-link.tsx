import Link from "next/link";

export function GoogleSignInLink({ next }: { next?: string }) {
  const href = next
    ? `/api/auth/google?next=${encodeURIComponent(next)}`
    : "/api/auth/google";
  return (
    <Link
      className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={href}
    >
      <span
        aria-hidden="true"
        className="grid size-5 place-items-center rounded-full border border-border text-xs font-bold text-primary"
      >
        G
      </span>
      Continue with Google
    </Link>
  );
}
