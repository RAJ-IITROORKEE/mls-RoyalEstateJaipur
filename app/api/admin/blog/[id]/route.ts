import { NextResponse } from "next/server";
import { BlogStatus } from "@prisma/client";

import { blogStatusSchema } from "@/features/blog/schemas";
import {
  canManageBlog,
  saveBlogPost,
  updateBlogStatus,
} from "@/features/blog/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !canManageBlog(access.profile.role))
    return NextResponse.json(
      { error: "Staff blog access is required." },
      { status: 403 },
    );
  const id = (await params).id;
  try {
    const body = (await request.json()) as {
      status?: unknown;
      content?: unknown;
    };
    if (body.status !== undefined) {
      const parsed = blogStatusSchema.parse({ status: body.status });
      const post = await updateBlogStatus(
        access.profile.id,
        id,
        BlogStatus[parsed.status],
      );
      return NextResponse.json({ ok: true, post });
    }
    const post = await saveBlogPost(access.profile.id, id, body);
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Blog post could not be updated.",
      },
      { status: 400 },
    );
  }
}
