import { EnquiryStatus, type ProfileRole } from "@prisma/client";

import { assertEnquiryTransition } from "@/features/enquiries/transitions";
import { prisma } from "@/lib/db/prisma";

export function canManageEnquiries(role: ProfileRole) {
  return role === "REVIEWER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function getAdminEnquiries(status?: EnquiryStatus) {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: status ? { status } : { status: { notIn: [EnquiryStatus.CLOSED_WON, EnquiryStatus.CLOSED_LOST, EnquiryStatus.SPAM] } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, type: true, status: true, contactName: true, email: true, phone: true, message: true, createdAt: true, assignedAdminId: true, assignedAdmin: { select: { displayName: true, email: true } }, property: { select: { referenceNumber: true, title: true } } },
    });
    return { connected: true as const, enquiries };
  } catch {
    return { connected: false as const, enquiries: [] };
  }
}

export async function getActiveStaff() {
  try {
    const staff = await prisma.profile.findMany({ where: { status: "ACTIVE", role: { in: ["REVIEWER", "ADMIN", "SUPER_ADMIN"] } }, orderBy: { displayName: "asc" }, select: { id: true, displayName: true, email: true, role: true } });
    return { connected: true as const, staff };
  } catch {
    return { connected: false as const, staff: [] };
  }
}

export async function updateEnquiryStatus(enquiryId: string, actorId: string, nextStatus: EnquiryStatus, note = "") {
  return prisma.$transaction(async (transaction) => {
    const enquiry = await transaction.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true, status: true, contactName: true, assignedAdminId: true } });
    if (!enquiry) throw new Error("Enquiry not found.");
    assertEnquiryTransition(enquiry.status, nextStatus);

    const updated = await transaction.enquiry.update({ where: { id: enquiry.id }, data: { status: nextStatus }, select: { id: true, status: true } });
    await transaction.enquiryActivity.create({ data: { enquiryId: enquiry.id, actorId, action: `STATUS_${nextStatus}`, note: note.trim() || null } });
    await transaction.auditLog.create({ data: { actorId, action: "ENQUIRY_STATUS_CHANGED", entityType: "Enquiry", entityId: enquiry.id, summary: `${enquiry.contactName} moved to ${nextStatus.toLowerCase().replaceAll("_", " ")}`, metadata: { from: enquiry.status, to: nextStatus } } });
    if (enquiry.assignedAdminId && enquiry.assignedAdminId !== actorId) await transaction.notification.create({ data: { recipientId: enquiry.assignedAdminId, type: "ENQUIRY_STATUS_CHANGED", title: "Assigned enquiry updated", body: `${enquiry.contactName}'s enquiry is now ${nextStatus.toLowerCase().replaceAll("_", " ")}.`, entityType: "Enquiry", entityId: enquiry.id } });
    return updated;
  });
}

export async function assignEnquiry(enquiryId: string, actorId: string, assignedAdminId: string | null) {
  return prisma.$transaction(async (transaction) => {
    const enquiry = await transaction.enquiry.findUnique({ where: { id: enquiryId }, select: { id: true, contactName: true, assignedAdminId: true } });
    if (!enquiry) throw new Error("Enquiry not found.");
    if (assignedAdminId) {
      const assignee = await transaction.profile.findFirst({ where: { id: assignedAdminId, status: "ACTIVE", role: { in: ["REVIEWER", "ADMIN", "SUPER_ADMIN"] } }, select: { id: true } });
      if (!assignee) throw new Error("Assignee is not eligible.");
    }
    const updated = await transaction.enquiry.update({ where: { id: enquiry.id }, data: { assignedAdminId }, select: { id: true, assignedAdminId: true } });
    await transaction.enquiryActivity.create({ data: { enquiryId: enquiry.id, actorId, action: assignedAdminId ? "ASSIGNED" : "UNASSIGNED", note: null } });
    await transaction.auditLog.create({ data: { actorId, action: assignedAdminId ? "ENQUIRY_ASSIGNED" : "ENQUIRY_UNASSIGNED", entityType: "Enquiry", entityId: enquiry.id, summary: `${enquiry.contactName} ${assignedAdminId ? "assigned" : "unassigned"}`, metadata: { previousAssigneeId: enquiry.assignedAdminId, assignedAdminId } } });
    if (assignedAdminId && assignedAdminId !== actorId) await transaction.notification.create({ data: { recipientId: assignedAdminId, type: "ENQUIRY_ASSIGNED", title: "Enquiry assigned to you", body: `You are now assigned to ${enquiry.contactName}'s enquiry.`, entityType: "Enquiry", entityId: enquiry.id } });
    return updated;
  });
}

export async function getUserNotifications(recipientId: string) {
  try {
    const notifications = await prisma.notification.findMany({ where: { recipientId }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, type: true, title: true, body: true, readAt: true, createdAt: true } });
    return { connected: true as const, notifications };
  } catch {
    return { connected: false as const, notifications: [] };
  }
}

export async function markNotificationRead(notificationId: string, recipientId: string) {
  return prisma.notification.updateMany({ where: { id: notificationId, recipientId, readAt: null }, data: { readAt: new Date() } });
}
