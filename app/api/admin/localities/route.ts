import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createLocality } from "@/features/site-content/mutations";
import { localityInputSchema } from "@/features/site-content/schemas";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { canManageSiteContent } from "@/lib/permissions/roles";

export async function POST(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile)
    return NextResponse.json({ error: "Sign in with an administrator account." }, { status: 401 });
  if (!canManageSiteContent(access.profile.role))
    return NextResponse.json({ error: "You cannot manage site content." }, { status: 403 });
  const parsed = localityInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Check the locality fields and try again." }, { status: 400 });
  try {
    const locality = await createLocality(access.profile.id, parsed.data);
    for (const path of ["/", "/properties", "/localities", "/admin/content"])
      revalidatePath(path);
    return NextResponse.json({ locality }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "The locality could not be saved." }, { status: 400 });
  }
}
