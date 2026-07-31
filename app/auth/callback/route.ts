import { NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/features/auth/schemas";
import { provisionProfile } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = getSafeRedirectPath(url.searchParams.get("next"), "/");
  const supabase = await createSupabaseServerClient();

  if (!supabase || !code) return NextResponse.redirect(new URL("/sign-in?error=The%20authentication%20link%20is%20invalid.", request.url));
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/sign-in?error=The%20authentication%20link%20has%20expired.", request.url));

  try {
    await provisionProfile(data.user);
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=Your%20account%20needs%20workspace%20setup.", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
