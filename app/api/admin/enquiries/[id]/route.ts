import { EnquiryStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { enquiryOperationSchema } from "@/features/enquiries/operations-schema";
import { canManageEnquiries, updateEnquiryStatus } from "@/features/enquiries/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !canManageEnquiries(access.profile.role)) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const parsed = enquiryOperationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "The enquiry update is invalid." }, { status: 400 });
  try {
    const result = await updateEnquiryStatus((await params).id, access.profile.id, parsed.data.status as EnquiryStatus, parsed.data.note);
    return NextResponse.json({ enquiry: result });
  } catch {
    return NextResponse.json({ error: "The enquiry could not be updated." }, { status: 400 });
  }
}
