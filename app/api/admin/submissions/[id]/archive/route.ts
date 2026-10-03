import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";

import {
  archiveSubmission,
  canPerformModeration,
} from "@/features/submissions/moderation";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

async function handlePOST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getCurrentUserAccess();
  if (
    access.mode !== "authorized" ||
    !canPerformModeration(access.profile.role)
  )
    return NextResponse.json(
      { error: "Staff access is required." },
      { status: 403 },
    );
  try {
    await archiveSubmission((await params).id, access.profile.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Submission could not be archived." },
      { status: 400 },
    );
  }
}

export const POST = withMutationBoundary(handlePOST);
