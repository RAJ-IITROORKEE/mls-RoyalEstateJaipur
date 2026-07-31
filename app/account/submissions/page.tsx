import { ArrowUpRight, ClipboardList, Database } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PublicPage } from "@/components/layout/public-page";
import { getOwnerSubmissions } from "@/features/submissions/service";
import { provisionProfile } from "@/lib/auth/profile";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { hasDatabaseConfiguration } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export default async function AccountSubmissionsPage() {
  const access = await getCurrentUserAccess();
  if (access.mode === "unauthenticated") redirect("/sign-in?redirect=%2Faccount%2Fsubmissions");
  if (access.mode === "setup" || access.mode === "database_setup" || !hasDatabaseConfiguration()) return <PublicPage><section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28"><div className="rounded-2xl border border-dashed border-border p-8"><Database aria-hidden="true" className="size-7 text-primary" /><h1 className="mt-6 font-serif text-4xl">Connect the workspace to track submissions.</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">Your account area is protected, but the application database is not connected yet.</p></div></section></PublicPage>;
  let ownerId: string;
  if (access.mode === "profile_setup") ownerId = (await provisionProfile(access.user)).id;
  else ownerId = access.profile.id;
  const submissions = await getOwnerSubmissions(ownerId);
  return <PublicPage><section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 sm:py-24"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Owner workspace</p><h1 className="mt-3 font-serif text-5xl">Your submissions.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Private drafts and review status, in one place.</p></div><Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground" href="/account/submissions/new">Start a submission <ArrowUpRight aria-hidden="true" className="size-4" /></Link></div>{submissions.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-border p-8 sm:p-12"><ClipboardList aria-hidden="true" className="size-7 text-primary" /><h2 className="mt-6 font-serif text-3xl">No submissions yet.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Start with the basics. You can save a private draft before deciding when to submit it for review.</p><Link className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold" href="/account/submissions/new">Create your first draft</Link></div> : <div className="mt-10 grid gap-3">{submissions.map((submission) => <Link className="grid gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 sm:grid-cols-[1fr_auto_auto] sm:items-center" href={`/account/submissions/${submission.id}`} key={submission.id}><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">{submission.referenceNumber}</p><h2 className="mt-2 font-serif text-2xl">{submission.category.toLowerCase()} for {submission.intent.toLowerCase()}</h2></div><span className="rounded-full bg-muted px-3 py-1 text-center text-xs font-bold">{submission.status.replaceAll("_", " ")}</span><span className="text-xs text-muted-foreground">Updated {formatDate(submission.updatedAt)}</span></Link>)}</div>}</section></PublicPage>;
}
