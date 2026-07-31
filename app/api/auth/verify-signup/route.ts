import { NextResponse } from "next/server";

import { signupOtpLength, signupOtpSchema } from "@/features/auth/schemas";
import { provisionProfile } from "@/lib/auth/profile";
import { hasDatabaseConfiguration, hasSupabaseConfiguration } from "@/lib/env";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth-signup-verify:${getRequestIdentifier(request)}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many verification attempts. Try again shortly." }, { status: 429 });
  }

  const input: unknown = await request.json().catch(() => null);
  const parsed = signupOtpSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: `Enter the ${signupOtpLength}-digit verification code.` }, { status: 400 });
  if (!hasSupabaseConfiguration() || !hasDatabaseConfiguration()) {
    return NextResponse.json({ error: "Account verification is not configured yet." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Account verification is not configured yet." }, { status: 503 });

  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "signup",
  });
  if (error || !data.user) {
    return NextResponse.json({ error: "That verification code is invalid or has expired." }, { status: 400 });
  }

  try {
    await provisionProfile(data.user, true);
  } catch {
    return NextResponse.json({ error: "Your email was verified, but the workspace profile needs setup." }, { status: 500 });
  }

  return NextResponse.json({ status: "verified", redirect: "/account/submissions" });
}
