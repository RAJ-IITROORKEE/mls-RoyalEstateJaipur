import { ArrowLeft, CheckCircle2, Clock3, Pencil, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PublicPage } from "@/components/layout/public-page";
import { canEditOwnerSubmission, getOwnerSubmission } from "@/features/submissions/service";
import { provisionProfile } from "@/lib/auth/profile";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { hasDatabaseConfiguration } from "@/lib/env";
import { formatDate } from "@/lib/utils";

const statusIcons = { DRAFT: Pencil, SUBMITTED: Clock3, UNDER_REVIEW: Clock3, NEEDS_CHANGES: Pencil, RESUBMITTED: Clock3, APPROVED: CheckCircle2, REJECTED: XCircle, WITHDRAWN: XCircle, ARCHIVED: XCircle } as const;

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await getCurrentUserAccess();
  if (access.mode === "unauthenticated") redirect("/sign-in?redirect=%2Faccount%2Fsubmissions");
  if (access.mode === "setup" || access.mode === "database_setup" || !hasDatabaseConfiguration()) return <PublicPage><section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28"><h1 className="font-serif text-4xl">Submission tracking is not configured.</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">Connect the workspace database to view private submission records.</p></section></PublicPage>;
  const ownerId = access.mode === "profile_setup" ? (await provisionProfile(access.user)).id : access.profile.id;
  const submission = await getOwnerSubmission(ownerId, (await params).id);
  if (!submission) notFound();
  const Icon = statusIcons[submission.status];
  return <PublicPage><section className="mx-auto max-w-[900px] px-5 py-16 sm:px-8 sm:py-24"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground" href="/account/submissions"><ArrowLeft aria-hidden="true" className="size-4" /> All submissions</Link><div className="mt-10 flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{submission.referenceNumber}</p><h1 className="mt-3 font-serif text-5xl">Submission status</h1></div><span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-bold"><Icon aria-hidden="true" className="size-4 text-primary" /> {submission.status.replaceAll("_", " ")}</span></div><div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8"><dl className="grid gap-6 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Purpose</dt><dd className="mt-2 font-semibold">{submission.intent} · {submission.category}</dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Last updated</dt><dd className="mt-2 font-semibold">{formatDate(submission.updatedAt)}</dd></div></dl>{submission.reason && <div className="mt-8 border-t border-border pt-6"><h2 className="font-bold">Reviewer note</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{submission.reason}</p></div>}{canEditOwnerSubmission(submission.status) && <Link className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground" href={`/account/submissions/new?id=${submission.id}`}><Pencil aria-hidden="true" className="size-4" /> Continue editing</Link>}</div></section></PublicPage>;
}
