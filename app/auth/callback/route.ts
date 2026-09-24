import { NextResponse } from "next/server";

import { getPostSignInRedirect } from "@/features/auth/schemas";
import { provisionProfile } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = await createSupabaseServerClient();

  if (!supabase || !code) return NextResponse.redirect(new URL("/sign-in?error=The%20authentication%20link%20is%20invalid.", request.url));
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/sign-in?error=The%20authentication%20link%20has%20expired.", request.url));

  try {
    const profile = await provisionProfile(data.user, true);
    if (profile.status !== "ACTIVE") {
      await supabase.auth.signOut();
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("error", "This account does not have workspace access.");
      return NextResponse.redirect(signInUrl);
    }
    const next = getPostSignInRedirect(url.searchParams.get("next"), profile.role);
    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=Your%20account%20needs%20workspace%20setup.", request.url));
  }
}
