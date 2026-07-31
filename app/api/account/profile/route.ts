import { NextResponse } from "next/server";

import { profileUpdateSchema } from "@/features/auth/profile-schema";
import { updateOwnProfile } from "@/lib/auth/profile";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export async function PATCH(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized")
    return NextResponse.json(
      { error: "Sign in to update your profile." },
      { status: 401 },
    );
  const parsed = profileUpdateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a name and a valid phone number." },
      { status: 400 },
    );
  try {
    return NextResponse.json({
      ok: true,
      profile: await updateOwnProfile(access.profile.id, parsed.data),
    });
  } catch {
    return NextResponse.json(
      { error: "Your profile could not be updated." },
      { status: 500 },
    );
  }
}
