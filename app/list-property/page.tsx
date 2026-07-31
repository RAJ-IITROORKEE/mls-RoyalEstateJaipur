import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";

import { PublicPage } from "@/components/layout/public-page";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export default async function ListPropertyPage() {
  const access = await getCurrentUserAccess();
  const isSignedIn = access.mode === "authorized";
  return (
    <PublicPage>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              For owners
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] sm:text-7xl">
              Present the property clearly.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              Share the essential facts, documents, and images in a private
              workspace. A reviewer decides what can become public.
            </p>
          </div>
          <div className="rounded-2xl bg-primary p-7 text-primary-foreground">
            <LockKeyhole aria-hidden="true" className="size-7 text-accent" />
            <h2 className="mt-8 font-serif text-3xl">Private by default.</h2>
            <p className="mt-3 text-sm leading-7 text-primary-foreground/70">
              Your draft and uploaded documents are not public listing content.
            </p>
            <Link
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-foreground"
              href={
                isSignedIn
                  ? "/account/submissions/new"
                  : "/sign-in?redirect=%2Flist-property"
              }
            >
              {isSignedIn ? "List your property" : "Sign in to begin"}{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1120px] gap-5 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-3">
        <article className="rounded-2xl border border-border p-6">
          <FileText aria-hidden="true" className="size-6 text-primary" />
          <h2 className="mt-8 font-serif text-2xl">Tell us the basics</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Intent, property type, locality, pricing context, and the facts a
            buyer or tenant will need.
          </p>
        </article>
        <article className="rounded-2xl border border-border p-6">
          <ImageIcon aria-hidden="true" className="size-6 text-primary" />
          <h2 className="mt-8 font-serif text-2xl">Add supporting media</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Images and private documents will use separate storage policies and
            ownership checks.
          </p>
        </article>
        <article className="rounded-2xl border border-border p-6">
          <LockKeyhole aria-hidden="true" className="size-6 text-primary" />
          <h2 className="mt-8 font-serif text-2xl">Follow the review</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            A submission can be returned for changes before an explicit
            publication decision.
          </p>
        </article>
      </section>
    </PublicPage>
  );
}
