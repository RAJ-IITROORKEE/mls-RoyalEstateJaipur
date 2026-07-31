import Link from "next/link";

import { PublicPage } from "@/components/layout/public-page";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ForgotPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = first(params.error);
  return <PublicPage><section className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-5 py-16 sm:px-8"><div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-10"><Link className="text-sm font-semibold text-primary" href="/sign-in">Back to sign in</Link><h1 className="mt-8 font-serif text-4xl">Reset access.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">We will send a time-limited reset link if the account exists.</p>{(error || params.sent) && <p aria-live="polite" className={`mt-5 rounded-xl border p-3 text-sm leading-6 ${error ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/5"}`}>{error ?? "Check your inbox for the reset link."}</p>}<form className="mt-8 grid gap-5" action="/api/auth/forgot-password" method="post"><label className="grid gap-2 text-sm font-semibold">Email<input className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" autoComplete="email" name="email" required type="email" /></label><Button className="min-h-12" type="submit">Send reset link</Button></form></div></section></PublicPage>;
}
