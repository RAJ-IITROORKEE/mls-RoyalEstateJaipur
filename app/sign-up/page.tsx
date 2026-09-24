import Link from "next/link";

import { SignUpFlow } from "@/components/forms/signup-flow";
import { GoogleSignInLink } from "@/components/forms/google-sign-in-link";
import { PublicPage } from "@/components/layout/public-page";

export default function SignUpPage() {
  return (
    <PublicPage>
      <section className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-5 py-16 sm:px-8">
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-[0_24px_80px_-48px_color-mix(in_oklch,var(--foreground)_25%,transparent)] sm:p-10">
          <Link className="mb-8 inline-flex text-sm font-semibold text-primary" href="/sign-in">
            Back to sign in
          </Link>
          <SignUpFlow />
          <div className="relative my-5 text-center text-xs text-muted-foreground">
            <span className="relative z-10 bg-card px-3">or create with</span>
            <span aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-border" />
          </div>
          <GoogleSignInLink next="/account/submissions" />
        </div>
      </section>
    </PublicPage>
  );
}
