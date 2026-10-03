import { getTrustedRequestOrigin } from "@/lib/security/request-origin";
import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";

import {
  authCredentialsSchema,
  getFormValue,
  getPostSignInRedirect,
} from "@/features/auth/schemas";
import { getSignInErrorMessage } from "@/features/auth/errors";
import { provisionProfile } from "@/lib/auth/profile";
import { hasDatabaseConfiguration, hasSupabaseConfiguration } from "@/lib/env";
import {
  checkRateLimit,
  getRequestIdentifier,
} from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithError(request: Request, message: string) {
  const url = new URL(
    "/sign-in",
    getTrustedRequestOrigin(request) ?? new URL(request.url).origin,
  );
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

async function handlePOST(request: Request) {
  const rateLimit = await checkRateLimit({
    key: `auth-sign-in:${getRequestIdentifier(request)}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.allowed)
    return redirectWithError(
      request,
      "Too many sign-in attempts. Try again shortly.",
    );
  const formData = await request.formData();
  const parsed = authCredentialsSchema.safeParse({
    email: getFormValue(formData, "email"),
    password: getFormValue(formData, "password"),
  });
  const requestedRedirect = getFormValue(formData, "redirect");

  if (!parsed.success)
    return redirectWithError(request, "Enter a valid email and password.");
  if (!hasSupabaseConfiguration())
    return redirectWithError(request, "Authentication is not configured yet.");

  const supabase = await createSupabaseServerClient();
  if (!supabase)
    return redirectWithError(request, "Authentication is not configured yet.");

  if (!hasDatabaseConfiguration())
    return redirectWithError(
      request,
      "The workspace database is not configured yet.",
    );
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user)
    return redirectWithError(request, getSignInErrorMessage(error));

  try {
    const profile = await provisionProfile(data.user, true);
    if (profile.status !== "ACTIVE") {
      await supabase.auth.signOut();
      return redirectWithError(
        request,
        "This account does not have workspace access.",
      );
    }
    const redirectPath = getPostSignInRedirect(requestedRedirect, profile.role);
    return NextResponse.redirect(
      new URL(
        redirectPath,
        getTrustedRequestOrigin(request) ?? new URL(request.url).origin,
      ),
      303,
    );
  } catch {
    await supabase.auth.signOut();
    return redirectWithError(
      request,
      "The workspace is unavailable. Please try again shortly.",
    );
  }
}

export const POST = withMutationBoundary(handlePOST);
