import { NextResponse } from "next/server";

import { enquiryAssignmentSchema } from "@/features/enquiries/operations-schema";
import { assignEnquiry, canManageEnquiries } from "@/features/enquiries/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !access.profile) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  if (!canManageEnquiries(access.profile.role)) return NextResponse.json({ error: "You are not allowed to assign enquiries." }, { status: 403 });
  const parsed = enquiryAssignmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "The assignee is invalid." }, { status: 400 });
  try {
    const result = await assignEnquiry((await params).id, access.profile.id, parsed.data.assignedAdminId);
    return NextResponse.json({ enquiry: result });
  } catch {
    return NextResponse.json({ error: "The enquiry assignment could not be saved." }, { status: 400 });
  }
}
