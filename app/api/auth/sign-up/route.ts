import { NextResponse } from "next/server";

import { getSignUpErrorMessage } from "@/features/auth/errors";
import { signUpSchema } from "@/features/auth/schemas";
import { provisionProfile } from "@/lib/auth/profile";
import { hasDatabaseConfiguration, hasSupabaseConfiguration } from "@/lib/env";
import { checkRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({ key: `auth-sign-up:${getRequestIdentifier(request)}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rateLimit.allowed) return NextResponse.json({ error: "Too many account requests. Try again later." }, { status: 429 });

  const input: unknown = await request.json().catch(() => null);
  const parsed = signUpSchema.safeParse(input);

  if (!parsed.success) return NextResponse.json({ error: "Use a name, valid email, and matching passwords of at least 8 characters." }, { status: 400 });
  if (!hasSupabaseConfiguration()) return NextResponse.json({ error: "Authentication is not configured yet." }, { status: 503 });
  if (!hasDatabaseConfiguration()) return NextResponse.json({ error: "The workspace database is not configured yet." }, { status: 503 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Authentication is not configured yet." }, { status: 503 });

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.displayName } },
  });
  if (error) {
    console.error("[auth:signup] Supabase rejected signup", {
      code: error.code ?? "unknown",
      status: error.status ?? 400,
    });
    return NextResponse.json({ error: getSignUpErrorMessage(error) }, { status: error.status === 429 ? 429 : 400 });
  }
  if (!data.user) {
    console.error("[auth:signup] Supabase returned an incomplete signup response");
    return NextResponse.json({ error: "Account creation returned an incomplete response. Try again shortly." }, { status: 502 });
  }

  if (data.session) {
    try {
      await provisionProfile(data.user);
      return NextResponse.json({ status: "created", redirect: "/account/submissions" });
    } catch {
      return NextResponse.json({ error: "The account was created, but its workspace profile needs setup." }, { status: 500 });
    }
  }

  return NextResponse.json({ status: "verification_required", email: parsed.data.email });
}
