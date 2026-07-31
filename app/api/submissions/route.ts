import { NextResponse } from "next/server";

import { saveOrSubmitOwnerSubmission } from "@/features/submissions/service";
import { submissionDraftSchema } from "@/features/submissions/schemas";
import { provisionProfile } from "@/lib/auth/profile";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { hasDatabaseConfiguration } from "@/lib/env";
import {
  checkRateLimit,
  getRequestIdentifier,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `submission:${getRequestIdentifier(request)}`,
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.allowed)
    return NextResponse.json(
      { error: "Too many submission updates. Try again shortly." },
      { status: 429 },
    );
  const access = await getCurrentUserAccess();
  if (
    access.mode === "setup" ||
    access.mode === "database_setup" ||
    !hasDatabaseConfiguration()
  )
    return NextResponse.json(
      { error: "The workspace is not configured yet." },
      { status: 503 },
    );
  if (access.mode === "unauthenticated")
    return NextResponse.json(
      { error: "Sign in to manage a submission." },
      { status: 401 },
    );

  let ownerId: string;
  if (access.mode === "profile_setup") {
    try {
      const profile = await provisionProfile(access.user);
      ownerId = profile.id;
    } catch {
      return NextResponse.json(
        { error: "Your workspace profile is not ready yet." },
        { status: 503 },
      );
    }
  } else {
    ownerId = access.profile.id;
  }

  const formData = await request.formData();
  const payloadValue = formData.get("payload");
  if (typeof payloadValue !== "string")
    return NextResponse.json(
      { error: "Submission data is missing." },
      { status: 400 },
    );
  let payload: unknown;
  try {
    payload = JSON.parse(payloadValue) as unknown;
  } catch {
    return NextResponse.json(
      { error: "Submission data is invalid." },
      { status: 400 },
    );
  }
  const parsedPayload = submissionDraftSchema.safeParse(payload);
  if (!parsedPayload.success)
    return NextResponse.json(
      { error: "Complete the submission fields before saving." },
      { status: 400 },
    );

  const action = formData.get("action");
  const submissionId = formData.get("submissionId");
  if (action !== "SAVE_DRAFT" && action !== "SUBMIT")
    return NextResponse.json(
      { error: "Submission action is invalid." },
      { status: 400 },
    );
  if (submissionId !== null && typeof submissionId !== "string")
    return NextResponse.json(
      { error: "Submission identifier is invalid." },
      { status: 400 },
    );

  try {
    const result = await saveOrSubmitOwnerSubmission(ownerId, {
      action,
      submissionId: submissionId || undefined,
      payload: parsedPayload.data,
    });
    return NextResponse.json({ ok: true, submission: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Submission not found.")
      return NextResponse.json({ error: message }, { status: 404 });
    if (message === "This submission can no longer be edited.")
      return NextResponse.json({ error: message }, { status: 409 });
    if (
      message === "The submission data is invalid." ||
      message.startsWith("Add ") ||
      message.startsWith("Complete ") ||
      message.startsWith("Specify ") ||
      message.startsWith("Bedroom ") ||
      message.startsWith("Consent ") ||
      message.startsWith("Plots ")
    )
      return NextResponse.json({ error: message }, { status: 400 });

    console.error("Submission mutation failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "The submission could not be saved right now. Please retry." },
      { status: 503 },
    );
  }
}
