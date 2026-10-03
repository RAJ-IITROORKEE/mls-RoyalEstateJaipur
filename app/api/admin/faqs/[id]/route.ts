import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteFaqItem,
  updateFaqItem,
} from "@/features/site-content/mutations";
import { faqInputSchema } from "@/features/site-content/schemas";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { canManageSiteContent } from "@/lib/permissions/roles";

type RouteContext = { params: Promise<{ id: string }> };

async function authorize(): Promise<
  { response: NextResponse } | { actorId: string }
> {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile)
    return {
      response: NextResponse.json(
        { error: "Sign in with an administrator account." },
        { status: 401 },
      ),
    };
  if (!canManageSiteContent(access.profile.role))
    return {
      response: NextResponse.json(
        { error: "You cannot manage site content." },
        { status: 403 },
      ),
    };
  return { actorId: access.profile.id };
}

async function handlePATCH(request: Request, context: RouteContext) {
  const auth = await authorize();
  if ("response" in auth) return auth.response;
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json(
      { error: "FAQ entry not found." },
      { status: 404 },
    );
  const parsed = faqInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the FAQ fields and try again." },
      { status: 400 },
    );
  try {
    const faq = await updateFaqItem(auth.actorId, id, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/content");
    return NextResponse.json({ faq });
  } catch {
    return NextResponse.json(
      { error: "The FAQ could not be updated." },
      { status: 400 },
    );
  }
}

async function handleDELETE(request: Request, context: RouteContext) {
  const auth = await authorize();
  if ("response" in auth) return auth.response;
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json(
      { error: "FAQ entry not found." },
      { status: 404 },
    );
  try {
    await deleteFaqItem(auth.actorId, id);
    revalidatePath("/");
    revalidatePath("/admin/content");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "The FAQ could not be deleted." },
      { status: 400 },
    );
  }
}

export const PATCH = withMutationBoundary(handlePATCH);

export const DELETE = withMutationBoundary(handleDELETE);
