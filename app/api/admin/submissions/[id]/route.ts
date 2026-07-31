import { NextResponse } from "next/server";

import { moderationActionSchema } from "@/features/submissions/schemas";
import {
  canPerformModeration,
  moderateSubmission,
} from "@/features/submissions/moderation";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getCurrentUserAccess();
  if (access.mode === "unauthenticated" || access.mode === "setup") return NextResponse.json({ error: "Staff authentication is required." }, { status: 401 });
  if (access.mode !== "authorized" || !canPerformModeration(access.profile.role)) return NextResponse.json({ error: "You do not have permission to review submissions." }, { status: 403 });
  const formData = await request.formData();
  const parsed = moderationActionSchema.safeParse({ action: formData.get("action"), reason: typeof formData.get("reason") === "string" ? formData.get("reason") : "" });
  if (!parsed.success) return NextResponse.json({ error: "Review action is invalid." }, { status: 400 });
  try {
    const result = await moderateSubmission((await params).id, access.profile.id, parsed.data.action, parsed.data.reason);
    return NextResponse.json({ ok: true, submission: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The review action could not be completed." }, { status: 400 });
  }
}
