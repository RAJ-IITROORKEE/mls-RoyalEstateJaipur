import { NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/features/auth/schemas";
import { hasSupabaseConfiguration } from "@/lib/env";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth-google:${getRequestIdentifier(request)}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  const signInUrl = new URL("/sign-in", process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin);
  if (!rateLimit.allowed) {
    signInUrl.searchParams.set("error", "Too many sign-in attempts. Try again shortly.");
    return NextResponse.redirect(signInUrl, 303);
  }
  if (!hasSupabaseConfiguration()) {
    signInUrl.searchParams.set("error", "Google sign-in is not configured yet.");
    return NextResponse.redirect(signInUrl, 303);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    signInUrl.searchParams.set("error", "Google sign-in is not configured yet.");
    return NextResponse.redirect(signInUrl, 303);
  }

  const url = new URL(request.url);
  const next = getSafeRedirectPath(url.searchParams.get("next"), "");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const callbackUrl = new URL("/auth/callback", origin);
  if (next) callbackUrl.searchParams.set("next", next);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error || !data.url) {
    signInUrl.searchParams.set("error", "Google sign-in could not start. Please try again.");
    return NextResponse.redirect(signInUrl, 303);
  }
  return NextResponse.redirect(data.url, 303);
}
