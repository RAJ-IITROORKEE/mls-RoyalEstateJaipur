import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/db/prisma";

const allowedTypes = ["image/jpeg", "image/png"] as const;

export async function POST(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized")
    return NextResponse.json(
      { error: "Sign in to update your profile image." },
      { status: 401 },
    );
  const file = (await request.formData()).get("file");
  if (
    !(file instanceof File) ||
    !allowedTypes.includes(file.type as (typeof allowedTypes)[number]) ||
    file.size > 5 * 1024 * 1024
  )
    return NextResponse.json(
      { error: "Use a JPG or PNG image up to 5 MB." },
      { status: 400 },
    );
  const admin = createSupabaseAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Profile image storage is not configured." },
      { status: 503 },
    );
  const extension = file.type === "image/png" ? "png" : "jpg";
  const path = `${access.profile.id}/${randomUUID()}.${extension}`;
  const upload = await admin.storage
    .from("profile-avatars")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error)
    return NextResponse.json(
      { error: "The profile image could not be uploaded." },
      { status: 502 },
    );
  try {
    await prisma.profile.update({
      where: { id: access.profile.id },
      data: { avatarPath: path },
    });
    return NextResponse.json({ ok: true });
  } catch {
    await admin.storage.from("profile-avatars").remove([path]);
    return NextResponse.json(
      { error: "The profile image could not be saved." },
      { status: 500 },
    );
  }
}
