import { NextResponse } from "next/server";

import { getFormValue, resetPasswordSchema } from "@/features/auth/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = resetPasswordSchema.safeParse({ password: getFormValue(formData, "password") });
  const destination = new URL("/reset-password", request.url);
  if (!parsed.success) {
    destination.searchParams.set("error", "Use a password of at least 8 characters.");
    return NextResponse.redirect(destination, 303);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    destination.searchParams.set("error", "Authentication is not configured yet.");
    return NextResponse.redirect(destination, 303);
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    destination.searchParams.set("error", "The reset link is no longer valid. Request a new one.");
    return NextResponse.redirect(destination, 303);
  }

  return NextResponse.redirect(new URL("/sign-in?reset=1", request.url), 303);
}
