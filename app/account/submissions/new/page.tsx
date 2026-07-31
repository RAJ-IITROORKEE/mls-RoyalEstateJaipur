import Link from "next/link";
import { redirect } from "next/navigation";

import {
  OwnerSubmissionWizard,
  defaultDraft,
} from "@/components/forms/owner-submission-wizard";
import { OwnerSubmissionDocuments } from "@/components/forms/owner-submission-documents";
import { PublicPage } from "@/components/layout/public-page";
import { getOwnerSubmission } from "@/features/submissions/service";
import { submissionDraftSchema } from "@/features/submissions/schemas";
import { provisionProfile } from "@/lib/auth/profile";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { hasDatabaseConfiguration } from "@/lib/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewSubmissionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const access = await getCurrentUserAccess();
  if (access.mode === "unauthenticated")
    redirect("/sign-in?redirect=%2Faccount%2Fsubmissions%2Fnew");
  if (
    access.mode === "setup" ||
    access.mode === "database_setup" ||
    !hasDatabaseConfiguration()
  )
    return (
      <PublicPage>
        <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
          <h1 className="font-serif text-4xl">
            Submission setup is not complete.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Connect Supabase Postgres before creating a private owner draft.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold"
            href="/contact"
          >
            Contact the team
          </Link>
        </section>
      </PublicPage>
    );
  const ownerId =
    access.mode === "profile_setup"
      ? (await provisionProfile(access.user)).id
      : access.profile.id;
  const submissionId = first((await searchParams).id);
  const existing = submissionId
    ? await getOwnerSubmission(ownerId, submissionId)
    : null;
  const initialDraft = existing
    ? submissionDraftSchema.safeParse(existing.payload).data
    : undefined;
  return (
    <PublicPage>
      <section className="mx-auto max-w-[1120px] px-5 py-12 sm:px-8 sm:py-20">
        <OwnerSubmissionWizard
          initialDraft={initialDraft ?? defaultDraft}
          initialSubmissionId={existing?.id}
        />
        {existing?.id && <OwnerSubmissionDocuments submissionId={existing.id} />}
      </section>
    </PublicPage>
  );
}
