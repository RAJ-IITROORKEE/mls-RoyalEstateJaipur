import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdminPage } from "@/lib/auth/guards";
import { canManageSiteContent } from "@/lib/permissions/roles";
import type { LocationFilters } from "@/features/site-content/location-table";

export async function getAdminLocations(filters: LocationFilters) {
  const access = await requireAdminPage();
  if (
    access.mode !== "authorized" ||
    !canManageSiteContent(access.profile.role)
  )
    return {
      state: "forbidden" as const,
      localities: [],
      total: 0,
      page: 1,
      pages: 1,
    };
  const where: Prisma.LocalityWhereInput = filters.q
    ? {
        OR: ["name", "city", "state"].map((field) => ({
          [field]: { contains: filters.q, mode: "insensitive" },
        })),
      }
    : {};
  const orderBy: Prisma.LocalityOrderByWithRelationInput[] =
    filters.sort === "name_desc"
      ? [{ name: "desc" }, { id: "asc" }]
      : filters.sort === "display_order"
        ? [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }]
        : filters.sort === "newest"
          ? [{ createdAt: "desc" }, { id: "asc" }]
          : [{ name: "asc" }, { id: "asc" }];
  try {
    const total = await prisma.locality.count({ where });
    const pages = Math.max(1, Math.ceil(total / 15));
    const page = Math.min(filters.page, pages);
    const localities = await prisma.locality.findMany({
      where,
      orderBy,
      skip: (page - 1) * 15,
      take: 15,
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        sortOrder: true,
        isFeatured: true,
        isActive: true,
        _count: { select: { properties: true } },
      },
    });
    return {
      state: "ready" as const,
      total,
      page,
      pages,
      localities: localities.map(({ _count, ...locality }) => ({
        ...locality,
        propertyCount: _count.properties,
      })),
    };
  } catch {
    return {
      state: "unavailable" as const,
      localities: [],
      total: 0,
      page: 1,
      pages: 1,
    };
  }
}
