import { NextResponse } from "next/server";

import { getFormValue } from "@/features/auth/schemas";
import { hasSupabaseConfiguration } from "@/lib/env";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({ key: `auth-reset:${getRequestIdentifier(request)}`, limit: 5, windowMs: 60 * 60 * 1000 });
  const formData = await request.formData();
  const email = getFormValue(formData, "email").trim();
  const destination = new URL("/forgot-password?sent=1", request.url);
  if (!rateLimit.allowed) {
    destination.searchParams.set("error", "Too many reset requests. Try again later.");
    return NextResponse.redirect(destination, 303);
  }
  if (!hasSupabaseConfiguration()) {
    destination.searchParams.set("error", "Authentication is not configured yet.");
    return NextResponse.redirect(destination, 303);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase || !email) {
    destination.searchParams.set("error", "Enter the email used for the account.");
    return NextResponse.redirect(destination, 303);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL("/", request.url).origin}/auth/callback?next=/reset-password`,
  });
  if (error) destination.searchParams.set("error", "We could not start the reset request.");
  return NextResponse.redirect(destination, 303);
}
