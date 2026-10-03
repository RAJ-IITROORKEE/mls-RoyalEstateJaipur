import { withMutationBoundary } from "@/lib/security/mutation-boundary";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function handlePOST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), 303);
}

export const POST = withMutationBoundary(handlePOST);
