import { ArrowLeft, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SubmissionReviewActions } from "@/components/admin/submission-review-actions";
import { getModerationSubmission } from "@/features/admin/submission-queries";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const submission = await getModerationSubmission((await params).id);
  if (!submission)
    return (
      <section className="rounded-2xl border border-dashed border-border p-8">
        <h1 className="font-serif text-3xl">Submission not found.</h1>
        <Link
          className="mt-5 inline-flex text-sm font-bold text-primary"
          href="/admin/submissions"
        >
          Back to queue
        </Link>
      </section>
    );
  const payload =
    typeof submission.payload === "object" && submission.payload !== null
      ? (submission.payload as Record<string, unknown>)
      : {};
  return (
    <section className="space-y-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
        href="/admin/submissions"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to queue
      </Link>
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {submission.referenceNumber}
        </p>
        <h1 className="mt-2 font-serif text-4xl">Review submission</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {submission.owner.displayName || submission.owner.email} ·{" "}
          {submission.status.replaceAll("_", " ")}
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-serif text-3xl">
            {typeof payload.title === "string"
              ? payload.title
              : "Untitled submission"}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {typeof payload.description === "string"
              ? payload.description
              : "No description provided."}
          </p>
          <dl className="mt-8 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Purpose
              </dt>
              <dd className="mt-2 text-sm font-semibold">
                {submission.intent} · {submission.category}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Location
              </dt>
              <dd className="mt-2 text-sm font-semibold">
                {String(payload.localityName || "Not provided")},{" "}
                {String(payload.city || "Not provided")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Area
              </dt>
              <dd className="mt-2 text-sm font-semibold">
                {String(payload.areaValue || "Not provided")}{" "}
                {String(payload.areaUnit || "")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Owner contact
              </dt>
              <dd className="mt-2 text-sm font-semibold">
                {submission.owner.phone || "Phone not provided"}
              </dd>
            </div>
          </dl>
          {submission.status === "UNDER_REVIEW" ||
          submission.status === "SUBMITTED" ||
          submission.status === "RESUBMITTED" ? (
            <div className="mt-8">
              <SubmissionReviewActions
                status={submission.status}
                submissionId={submission.id}
              />
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
              This submission is no longer in an actionable review state.
            </p>
          )}
        </article>
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Preview media
              </p>
              <h2 className="mt-2 font-serif text-3xl">Property showcase</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {submission.media.length} image
              {submission.media.length === 1 ? "" : "s"}
            </span>
          </div>
          {submission.media.length === 0 ? (
            <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              No preview images attached.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {submission.media.map((media) => (
                <figure
                  className="overflow-hidden rounded-xl border border-border"
                  key={media.id}
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {media.url ? (
                      <Image
                        alt={media.altText}
                        className="object-cover"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        src={media.url}
                        unoptimized
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-xs text-muted-foreground">
                        Preview unavailable
                      </span>
                    )}
                  </div>
                  <figcaption className="flex items-center justify-between gap-2 p-3 text-xs">
                    <span className="truncate">{media.fileName}</span>
                    {media.isCover && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">
                        Cover
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Private documents</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Document paths remain server-only. Authorized signed review links
            will be added to the storage workflow.
          </p>
          {submission.documents.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No documents attached.
            </p>
          ) : (
            <ul className="mt-6 grid gap-3">
              {submission.documents.map((document) => (
                <li
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                  key={document.id}
                >
                  <FileText
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  <span className="min-w-0 truncate text-sm font-semibold">
                    {document.fileName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
