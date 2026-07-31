import { NextResponse } from "next/server";

import { archiveAuditEntry } from "@/features/admin/audit";
import { auditArchiveSchema } from "@/features/admin/audit-schema";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export async function POST(request: Request) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || access.profile.role !== "SUPER_ADMIN")
    return NextResponse.json(
      { error: "Super admin access is required." },
      { status: 403 },
    );
  const parsed = auditArchiveSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Archive request is invalid." },
      { status: 400 },
    );
  try {
    await archiveAuditEntry(
      access.profile.id,
      parsed.data.auditLogId,
      parsed.data.reason,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Audit entry could not be archived.",
      },
      { status: 400 },
    );
  }
}
