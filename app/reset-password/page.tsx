import Link from "next/link";

import { PublicPage } from "@/components/layout/public-page";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const error = first((await searchParams).error);
  return <PublicPage><section className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-5 py-16 sm:px-8"><div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-10"><Link className="text-sm font-semibold text-primary" href="/sign-in">Back to sign in</Link><h1 className="mt-8 font-serif text-4xl">Choose a new password.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">This form works only after opening a valid reset link.</p>{error && <p aria-live="polite" className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm leading-6 text-destructive">{error}</p>}<form className="mt-8 grid gap-5" action="/api/auth/reset-password" method="post"><label className="grid gap-2 text-sm font-semibold">New password<input className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" autoComplete="new-password" minLength={8} name="password" required type="password" /></label><Button className="min-h-12" type="submit">Update password</Button></form></div></section></PublicPage>;
}
