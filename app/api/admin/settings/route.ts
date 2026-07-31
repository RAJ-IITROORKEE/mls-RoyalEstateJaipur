import { NextResponse } from "next/server";

import { updateSiteSetting } from "@/features/admin/settings";
import { settingsUpdateSchema } from "@/features/admin/settings-schema";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { canManageSettings } from "@/lib/permissions/roles";

export async function POST(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  if (!canManageSettings(access.profile.role)) return NextResponse.json({ error: "You are not allowed to edit settings." }, { status: 403 });
  const parsed = settingsUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "The setting value is invalid." }, { status: 400 });
  try {
    const setting = await updateSiteSetting(access.profile.id, parsed.data.key, parsed.data.value);
    return NextResponse.json({ setting: { key: setting.key, value: setting.value } });
  } catch {
    return NextResponse.json({ error: "The setting could not be saved." }, { status: 400 });
  }
}
