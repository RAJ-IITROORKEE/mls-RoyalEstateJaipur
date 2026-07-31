import { hasDatabaseConfiguration } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

export type AdminDashboardSummary = {
  connected: boolean;
  pendingSubmissions: number;
  publishedProperties: number;
  newEnquiries: number;
  unreadNotifications: number;
  totalUsers: number;
  recentActivity: Array<{
    id: string;
    action: string;
    summary: string;
    createdAt: Date;
  }>;
};

const emptySummary: AdminDashboardSummary = {
  connected: false,
  newEnquiries: 0,
  pendingSubmissions: 0,
  publishedProperties: 0,
  unreadNotifications: 0,
  totalUsers: 0,
  recentActivity: [],
};

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  if (!hasDatabaseConfiguration()) return emptySummary;
  try {
    const [
      pendingSubmissions,
      publishedProperties,
      newEnquiries,
      unreadNotifications,
      totalUsers,
      recentActivity,
    ] = await Promise.all([
      prisma.propertySubmission.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED"] } },
      }),
      prisma.property.count({ where: { status: "PUBLISHED" } }),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.notification.count({ where: { readAt: null } }),
      prisma.profile.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, action: true, summary: true, createdAt: true },
      }),
    ]);
    return {
      connected: true,
      pendingSubmissions,
      publishedProperties,
      newEnquiries,
      unreadNotifications,
      totalUsers,
      recentActivity,
    };
  } catch {
    return emptySummary;
  }
}
