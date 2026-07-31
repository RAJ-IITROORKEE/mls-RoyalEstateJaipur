import { NextResponse } from "next/server";

import { signupResendSchema } from "@/features/auth/schemas";
import { hasSupabaseConfiguration } from "@/lib/env";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth-signup-resend:${getRequestIdentifier(request)}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many code requests. Try again later." }, { status: 429 });
  }

  const input: unknown = await request.json().catch(() => null);
  const parsed = signupResendSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!hasSupabaseConfiguration()) {
    return NextResponse.json({ error: "Account verification is not configured yet." }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Account verification is not configured yet." }, { status: 503 });

  const { error } = await supabase.auth.resend({ email: parsed.data.email, type: "signup" });
  if (error) return NextResponse.json({ error: "A new verification code could not be sent yet." }, { status: 400 });

  return NextResponse.json({ status: "sent" });
}
