import { getTrustedRequestOrigin } from "@/lib/security/request-origin";
import { NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/features/auth/schemas";
import { getGoogleProviderStatus } from "@/features/auth/provider-availability";
import { hasSupabaseConfiguration } from "@/lib/env";
import {
  checkRateLimit,
  getRequestIdentifier,
} from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const origin = getTrustedRequestOrigin(request);
  if (!origin)
    return NextResponse.json(
      { error: "Use the configured site to sign in." },
      { status: 403 },
    );
  const rateLimit = await checkRateLimit({
    key: `auth-google:${getRequestIdentifier(request)}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  }).catch(() => null);
  const signInUrl = new URL("/sign-in", origin);
  if (!rateLimit?.allowed) {
    signInUrl.searchParams.set(
      "error",
      rateLimit
        ? "Too many sign-in attempts. Try again shortly."
        : "Sign-in is temporarily unavailable. Please try again shortly.",
    );
    return NextResponse.redirect(signInUrl, 303);
  }
  if (!hasSupabaseConfiguration()) {
    signInUrl.searchParams.set(
      "error",
      "Google sign-in is not configured yet.",
    );
    return NextResponse.redirect(signInUrl, 303);
  }

  if ((await getGoogleProviderStatus()) === "disabled") {
    signInUrl.searchParams.set(
      "error",
      "Google sign-in is disabled in this Supabase project. An administrator must finish the Google OAuth provider setup.",
    );
    return NextResponse.redirect(signInUrl, 303);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    signInUrl.searchParams.set(
      "error",
      "Google sign-in is not configured yet.",
    );
    return NextResponse.redirect(signInUrl, 303);
  }

  const url = new URL(request.url);
  const next = getSafeRedirectPath(url.searchParams.get("next"), "");
  const callbackUrl = new URL("/auth/callback", origin);
  if (next) callbackUrl.searchParams.set("next", next);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error || !data.url) {
    signInUrl.searchParams.set(
      "error",
      "Google sign-in could not start. Please try again.",
    );
    return NextResponse.redirect(signInUrl, 303);
  }
  return NextResponse.redirect(data.url, 303);
}
