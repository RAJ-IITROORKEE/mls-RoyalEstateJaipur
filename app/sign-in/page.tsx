import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { PasswordField } from "@/components/forms/password-field";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = first(params.error);
  const notice = params.created
    ? "Account created. Check your email if verification is enabled, then sign in."
    : params.reset
      ? "Password updated. You can sign in with the new password."
      : null;
  const redirectPath = first(params.redirect) ?? "";
  return (
    <main className="grid min-h-screen lg:grid-cols-[0.85fr_1.15fr]">
      <section className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link
          className="flex items-center gap-3 text-sm font-bold tracking-[0.14em]"
          href="/"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-xs text-accent-foreground">
            RS
          </span>{" "}
          ROYALESTATEJAIPUR
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Owner workspace
          </p>
          <h1 className="mt-5 max-w-md font-serif text-6xl leading-[0.95]">
            Keep the details close.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-primary-foreground/70">
            Sign in to save a submission, return to your draft, or follow its
            review status.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/50">
          A secure Supabase Auth session powers this workspace.
        </p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <Link
            className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Back to site
          </Link>
          <div className="mb-8">
            <span className="grid size-11 place-items-center rounded-xl bg-muted text-primary">
              <LockKeyhole aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-6 font-serif text-4xl">Welcome back.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the email connected to your owner workspace.
            </p>
          </div>
          {(error || notice) && (
            <p
              aria-live="polite"
              className={`mb-5 rounded-xl border p-3 text-sm leading-6 ${error ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/5 text-foreground"}`}
            >
              {error ?? notice}
            </p>
          )}
          <form className="grid gap-5" action="/api/auth/sign-in" method="post">
            <input name="redirect" type="hidden" value={redirectPath} />
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <input
                className="min-h-12 rounded-xl border border-border bg-card px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoComplete="email"
                name="email"
                required
                type="email"
              />
            </label>
            <PasswordField
              autoComplete="current-password"
              label="Password"
              name="password"
            />
            <Button className="mt-2 min-h-12" type="submit">
              Sign in
            </Button>
          </form>
          <div className="mt-6 flex justify-between gap-4 text-sm">
            <Link
              className="font-semibold text-primary"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
            <Link className="font-semibold text-primary" href="/sign-up">
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
