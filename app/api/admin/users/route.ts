import { NextResponse } from "next/server";

import { profileAccessSchema } from "@/features/admin/user-schema";
import { updateProfileAccess } from "@/features/admin/users";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { canManageStaff } from "@/lib/permissions/roles";

export async function POST(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  if (!canManageStaff(access.profile.role)) return NextResponse.json({ error: "Only an active super admin can manage access." }, { status: 403 });
  const parsed = profileAccessSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "The access update is invalid." }, { status: 400 });
  try {
    const profile = await updateProfileAccess(access.profile.id, parsed.data.profileId, parsed.data.role, parsed.data.status);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "The access update could not be saved." }, { status: 400 });
  }
}
