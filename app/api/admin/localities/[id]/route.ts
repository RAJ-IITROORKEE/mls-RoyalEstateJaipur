import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deactivateLocality,
  updateLocality,
} from "@/features/site-content/mutations";
import { localityInputSchema } from "@/features/site-content/schemas";
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
    return NextResponse.json({ error: "Locality not found." }, { status: 404 });
  const parsed = localityInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the locality fields and try again." },
      { status: 400 },
    );
  try {
    const locality = await updateLocality(auth.actorId, id, parsed.data);
    for (const path of ["/", "/properties", "/localities", "/admin/content"])
      revalidatePath(path);
    return NextResponse.json({ locality });
  } catch {
    return NextResponse.json(
      { error: "The locality could not be updated." },
      { status: 400 },
    );
  }
}

async function handleDELETE(_request: Request, context: RouteContext) {
  const auth = await authorize();
  if ("response" in auth) return auth.response;
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json({ error: "Locality not found." }, { status: 404 });
  try {
    await deactivateLocality(auth.actorId, id);
    for (const path of ["/", "/properties", "/localities", "/admin/content"])
      revalidatePath(path);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "The locality could not be removed." },
      { status: 400 },
    );
  }
}

export const PATCH = withMutationBoundary(handlePATCH);

export const DELETE = withMutationBoundary(handleDELETE);
