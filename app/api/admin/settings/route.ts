import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { updateSiteSetting } from "@/features/admin/settings";
import { settingsUpdateSchema } from "@/features/admin/settings-schema";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { canManageSettings } from "@/lib/permissions/roles";

export async function POST(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  if (!canManageSettings(access.profile.role)) return NextResponse.json({ error: "You are not allowed to edit settings." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The setting value is invalid." }, { status: 400 });
  }
  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "The setting value is invalid." }, { status: 400 });
  try {
    const setting = await updateSiteSetting(access.profile.id, parsed.data.key, parsed.data.value);
    if (parsed.data.key === "appearance.fontFamily") {
      revalidateTag("site-font-family", { expire: 0 });
      revalidatePath("/", "layout");
    }
    return NextResponse.json({ setting: { key: setting.key, value: setting.value } });
  } catch {
    return NextResponse.json({ error: "The setting could not be saved." }, { status: 400 });
  }
}
