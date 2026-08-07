import { ArrowUpRight, ClipboardList, Search, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PublicPage } from "@/components/layout/public-page";
import { getOwnerSubmissions } from "@/features/submissions/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { getPublicAvatarUrl } from "@/lib/supabase/public-avatar-url";

export default async function AccountDashboardPage() {
  const access = await getCurrentUserAccess();
  if (access.mode === "unauthenticated")
    redirect("/sign-in?redirect=%2Faccount");
  if (access.mode !== "authorized")
    return (
      <PublicPage>
        <section className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-serif text-4xl">
            Your dashboard is being prepared.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Please try again after the workspace profile is connected.
          </p>
        </section>
      </PublicPage>
    );
  const submissions = await getOwnerSubmissions(access.profile.id);
  const avatarUrl = getPublicAvatarUrl(access.profile.avatarPath);
  return (
    <PublicPage>
      <section className="mx-auto max-w-[1120px] px-5 py-12 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center overflow-hidden rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {avatarUrl ? (
                <Image
                  alt=""
                  className="size-full object-cover"
                  height={64}
                  src={avatarUrl}
                  width={64}
                />
              ) : (
                (access.profile.displayName ?? access.profile.email)
                  .slice(0, 1)
                  .toUpperCase()
              )}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Your workspace
              </p>
              <h1 className="mt-2 font-serif text-5xl">
                Welcome back
                {access.profile.displayName
                  ? `, ${access.profile.displayName.split(" ")[0]}`
                  : ""}
                .
              </h1>
            </div>
          </div>
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold hover:bg-muted"
            href="/account/settings"
          >
            <Settings2 className="size-4" /> Settings
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40"
            href="/account/submissions"
          >
            <ClipboardList className="size-6 text-primary" />
            <p className="mt-8 text-4xl font-bold">{submissions.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Applications submitted
            </p>
          </Link>
          <Link
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40"
            href="/properties"
          >
            <Search className="size-6 text-primary" />
            <p className="mt-8 font-serif text-3xl">Explore</p>
            <p className="mt-2 text-sm text-muted-foreground">
              See properties to buy, rent, or lease
            </p>
          </Link>
          <Link
            className="rounded-2xl bg-primary p-6 text-primary-foreground transition hover:bg-primary-hover hover:text-primary-hover-foreground"
            href="/account/submissions/new"
          >
            <ArrowUpRight className="size-6 text-accent" />
            <p className="mt-8 font-serif text-3xl">List yours</p>
            <p className="mt-2 text-sm text-primary-foreground/70">
              Create a private property submission
            </p>
          </Link>
        </div>
        {submissions.length > 0 && (
          <div className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Recent applications
                </p>
                <h2 className="mt-2 font-serif text-3xl">
                  Keep track of the details.
                </h2>
              </div>
              <Link
                className="text-sm font-bold text-primary"
                href="/account/submissions"
              >
                See all
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {submissions.slice(0, 3).map((submission) => (
                <Link
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-5"
                  href={`/account/submissions/${submission.id}`}
                  key={submission.id}
                >
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-primary">
                      {submission.referenceNumber}
                    </span>
                    <span className="mt-2 block font-serif text-2xl">
                      {submission.category.toLowerCase()} for{" "}
                      {submission.intent.toLowerCase()}
                    </span>
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">
                    {submission.status.replaceAll("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </PublicPage>
  );
}
