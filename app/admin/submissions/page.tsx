import { ClipboardList, Database } from "lucide-react";
import Link from "next/link";

import { SubmissionArchiveAction } from "@/components/admin/submission-archive-action";
import { getModerationQueue } from "@/features/admin/submission-queries";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const status = first((await searchParams).status);
  const result = await getModerationQueue(status);
  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Moderation
          </p>
          <h1 className="mt-2 font-serif text-4xl">Property submissions</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review owner-provided details, request changes, and make publication
            an explicit decision.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <Link
            className={`rounded-full border px-3 py-2 ${!status ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
            href="/admin/submissions"
          >
            Needs review
          </Link>
          <Link
            className={`rounded-full border px-3 py-2 ${status === "NEEDS_CHANGES" ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
            href="/admin/submissions?status=NEEDS_CHANGES"
          >
            Changes requested
          </Link>
          <Link
            className={`rounded-full border px-3 py-2 ${status === "APPROVED" ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
            href="/admin/submissions?status=APPROVED"
          >
            Approved
          </Link>
        </div>
      </header>
      {!result.connected ? (
        <section className="rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="mx-auto max-w-lg text-center">
            <Database
              aria-hidden="true"
              className="mx-auto size-7 text-primary"
            />
            <h2 className="mt-5 text-xl font-bold">
              Connect the moderation database
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The queue will show only server-fetched records after the Prisma
              migration is applied.
            </p>
          </div>
        </section>
      ) : result.submissions.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-8 sm:p-12">
          <ClipboardList aria-hidden="true" className="size-7 text-primary" />
          <h2 className="mt-5 font-serif text-3xl">
            No submissions in this view.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            New owner submissions will appear here after they are submitted for
            review.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
            <span>Reference</span>
            <span>Owner</span>
            <span>Status</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>
          {result.submissions.map((submission) => (
            <Link
              className="grid gap-3 border-b border-border p-5 last:border-0 hover:bg-muted/30 sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] sm:items-center"
              href={`/admin/submissions/${submission.id}`}
              key={submission.id}
            >
              <div>
                <p className="text-xs font-bold text-primary">
                  {submission.referenceNumber}
                </p>
                <p className="mt-1 font-semibold">
                  {submission.category.toLowerCase()} ·{" "}
                  {submission.intent.toLowerCase()}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {submission.owner.displayName || submission.owner.email}
              </p>
              <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-bold">
                {submission.status.replaceAll("_", " ")}
              </span>
              <p className="text-xs text-muted-foreground">
                {submission.updatedAt.toLocaleDateString("en-IN")}
              </p>
              <span className="flex justify-end">
                {(submission.status === "APPROVED" ||
                  submission.status === "REJECTED") && (
                  <SubmissionArchiveAction submissionId={submission.id} />
                )}
              </span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
