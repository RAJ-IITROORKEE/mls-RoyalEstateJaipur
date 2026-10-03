import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";

import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { markNotificationRead } from "@/features/enquiries/service";

async function handlePOST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized")
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  await markNotificationRead((await params).id, access.profile.id);
  return NextResponse.json({ ok: true });
}

export const POST = withMutationBoundary(handlePOST);
