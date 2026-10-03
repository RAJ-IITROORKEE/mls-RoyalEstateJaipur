import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";

import { getFormValue, resetPasswordSchema } from "@/features/auth/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import {
  checkRateLimit,
  getRequestIdentifier,
} from "@/lib/security/rate-limit";

async function handlePOST(request: Request) {
  const limit = await checkRateLimit({
    key: `auth-password-update:${getRequestIdentifier(request)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Too many password changes. Try again shortly." },
      { status: 429 },
    );
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized")
    return NextResponse.json(
      { error: "Use a valid reset link to change your password." },
      { status: 401 },
    );
  const formData = await request.formData();
  const parsed = resetPasswordSchema.safeParse({
    password: getFormValue(formData, "password"),
  });
  const destination = new URL("/reset-password", request.url);
  if (!parsed.success) {
    destination.searchParams.set(
      "error",
      "Use a password of at least 8 characters.",
    );
    return NextResponse.redirect(destination, 303);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    destination.searchParams.set(
      "error",
      "Authentication is not configured yet.",
    );
    return NextResponse.redirect(destination, 303);
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    destination.searchParams.set(
      "error",
      "The reset link is no longer valid. Request a new one.",
    );
    return NextResponse.redirect(destination, 303);
  }
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/sign-in?reset=1", request.url), 303);
}

export const POST = withMutationBoundary(handlePOST);
