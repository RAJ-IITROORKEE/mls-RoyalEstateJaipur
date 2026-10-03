import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createFaqItem } from "@/features/site-content/mutations";
import { faqInputSchema } from "@/features/site-content/schemas";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { canManageSiteContent } from "@/lib/permissions/roles";

async function handlePOST(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile)
    return NextResponse.json(
      { error: "Sign in with an administrator account." },
      { status: 401 },
    );
  if (!canManageSiteContent(access.profile.role))
    return NextResponse.json(
      { error: "You cannot manage site content." },
      { status: 403 },
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
    const faq = await createFaqItem(access.profile.id, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/content");
    return NextResponse.json({ faq }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "The FAQ could not be saved." },
      { status: 400 },
    );
  }
}

export const POST = withMutationBoundary(handlePOST);
