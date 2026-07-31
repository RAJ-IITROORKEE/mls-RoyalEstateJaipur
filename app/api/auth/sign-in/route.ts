import { NextResponse } from "next/server";

import { authCredentialsSchema, getFormValue, getPostSignInRedirect } from "@/features/auth/schemas";
import { getSignInErrorMessage } from "@/features/auth/errors";
import { provisionProfile } from "@/lib/auth/profile";
import { hasDatabaseConfiguration, hasSupabaseConfiguration } from "@/lib/env";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getRequestOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = request.headers.get("origin");

  if (host && origin) {
    try {
      const parsedOrigin = new URL(origin);
      if (parsedOrigin.host === host) return parsedOrigin.origin;
    } catch {
      // Fall back to Next.js's normalized request URL.
    }
  }

  return new URL(request.url).origin;
}

function redirectWithError(request: Request, message: string) {
  const url = new URL("/sign-in", getRequestOrigin(request));
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({ key: `auth-sign-in:${getRequestIdentifier(request)}`, limit: 10, windowMs: 15 * 60 * 1000 });
  if (!rateLimit.allowed) return redirectWithError(request, "Too many sign-in attempts. Try again shortly.");
  const formData = await request.formData();
  const parsed = authCredentialsSchema.safeParse({
    email: getFormValue(formData, "email"),
    password: getFormValue(formData, "password"),
  });
  const requestedRedirect = getFormValue(formData, "redirect");

  if (!parsed.success) return redirectWithError(request, "Enter a valid email and password.");
  if (!hasSupabaseConfiguration()) return redirectWithError(request, "Authentication is not configured yet.");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return redirectWithError(request, "Authentication is not configured yet.");

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return redirectWithError(request, getSignInErrorMessage(error));
  if (!hasDatabaseConfiguration()) return redirectWithError(request, "The workspace database is not configured yet.");

  try {
    const profile = await provisionProfile(data.user, true);
    const redirectPath = getPostSignInRedirect(requestedRedirect, profile.role);
    return NextResponse.redirect(new URL(redirectPath, getRequestOrigin(request)), 303);
  } catch {
    return redirectWithError(request, "Your session started, but the workspace profile is not ready yet.");
  }
}
