import { NextResponse } from "next/server";

import { archiveSubmission, canPerformModeration } from "@/features/submissions/moderation";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !canPerformModeration(access.profile.role))
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
  try {
    await archiveSubmission((await params).id, access.profile.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Submission could not be archived." }, { status: 400 });
  }
}
