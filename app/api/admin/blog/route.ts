import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";

import { canManageBlog, saveBlogPost } from "@/features/blog/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

async function handlePOST(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !canManageBlog(access.profile.role))
    return NextResponse.json(
      { error: "Staff blog access is required." },
      { status: 403 },
    );
  try {
    const post = await saveBlogPost(
      access.profile.id,
      undefined,
      await request.json(),
    );
    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json(
      {
        error: "Blog post could not be saved.",
      },
      { status: 400 },
    );
  }
}

export const POST = withMutationBoundary(handlePOST);
