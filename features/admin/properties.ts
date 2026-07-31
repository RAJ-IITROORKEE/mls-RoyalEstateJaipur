import {
  Prisma,
  ProfileRole,
  ProfileStatus,
  PropertyCategory,
  PropertyIntent,
  PropertyStatus,
} from "@prisma/client";

import type { PropertyDetailsUpdate } from "@/features/admin/property-schema";
import { assertPropertyStatusTransition } from "@/features/properties/lifecycle";
import { prisma } from "@/lib/db/prisma";
import { canManagePropertyInventory } from "@/lib/permissions/roles";
import { getPublicPropertyMediaUrl } from "@/lib/supabase/public-url";

export const adminPropertySorts = [
  "updated_desc",
  "published_desc",
  "price_asc",
  "price_desc",
  "title_asc",
] as const;
export type AdminPropertySort = (typeof adminPropertySorts)[number];

export type AdminPropertyFilters = {
  query?: string;
  status?: PropertyStatus;
  intent?: PropertyIntent;
  category?: PropertyCategory;
  sort?: AdminPropertySort;
  page?: number;
};

const pageSize = 20;

function propertyOrderBy(
  sort: AdminPropertySort,
): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ priceMinor: "asc" }, { updatedAt: "desc" }];
    case "price_desc":
      return [{ priceMinor: "desc" }, { updatedAt: "desc" }];
    case "published_desc":
      return [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { updatedAt: "desc" },
      ];
    case "title_asc":
      return [{ title: "asc" }, { updatedAt: "desc" }];
    default:
      return [{ updatedAt: "desc" }];
  }
}

export async function getAdminPropertyInventory(
  filters: AdminPropertyFilters = {},
) {
  const query = filters.query?.trim().slice(0, 120) ?? "";
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const sort = adminPropertySorts.includes(filters.sort ?? "updated_desc")
    ? (filters.sort ?? "updated_desc")
    : "updated_desc";
  const where: Prisma.PropertyWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.intent ? { intent: filters.intent } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { referenceNumber: { contains: query, mode: "insensitive" } },
            { localityName: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { owner: { email: { contains: query, mode: "insensitive" } } },
            {
              owner: { displayName: { contains: query, mode: "insensitive" } },
            },
          ],
        }
      : {}),
  };

  try {
    const [
      properties,
      total,
      totalProperties,
      published,
      drafts,
      archived,
      featured,
      statusGroups,
      intentGroups,
      categoryGroups,
    ] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: propertyOrderBy(sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          referenceNumber: true,
          status: true,
          intent: true,
          category: true,
          priceMinor: true,
          priceOnRequest: true,
          localityName: true,
          city: true,
          bedrooms: true,
          areaValue: true,
          areaUnit: true,
          isFeatured: true,
          publishedAt: true,
          updatedAt: true,
          owner: { select: { displayName: true, email: true } },
          media: {
            orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { storagePath: true, altText: true },
          },
        },
      }),
      prisma.property.count({ where }),
      prisma.property.count(),
      prisma.property.count({ where: { status: PropertyStatus.PUBLISHED } }),
      prisma.property.count({ where: { status: PropertyStatus.DRAFT } }),
      prisma.property.count({ where: { status: PropertyStatus.ARCHIVED } }),
      prisma.property.count({
        where: { isFeatured: true, status: PropertyStatus.PUBLISHED },
      }),
      prisma.property.groupBy({
        by: ["status"],
        _count: { _all: true },
        orderBy: { status: "asc" },
      }),
      prisma.property.groupBy({
        by: ["intent"],
        _count: { _all: true },
        orderBy: { intent: "asc" },
      }),
      prisma.property.groupBy({
        by: ["category"],
        _count: { _all: true },
        orderBy: { category: "asc" },
      }),
    ]);

    return {
      connected: true as const,
      properties: properties.map((property) => {
        const { media, ...listing } = property;
        return {
          ...listing,
          priceMinor: property.priceMinor?.toString() ?? null,
          areaValue: property.areaValue?.toString() ?? null,
          coverImage: media[0]
            ? {
                url: getPublicPropertyMediaUrl(media[0].storagePath),
                altText: media[0].altText,
              }
            : null,
        };
      }),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      stats: {
        total: totalProperties,
        published,
        drafts,
        archived,
        featured,
        byStatus: statusGroups.map((group) => ({
          label: group.status,
          count: group._count._all,
        })),
        byIntent: intentGroups.map((group) => ({
          label: group.intent,
          count: group._count._all,
        })),
        byCategory: categoryGroups.map((group) => ({
          label: group.category,
          count: group._count._all,
        })),
      },
    };
  } catch {
    return {
      connected: false as const,
      properties: [],
      total: 0,
      page: 1,
      pageSize,
      pageCount: 1,
      stats: {
        total: 0,
        published: 0,
        drafts: 0,
        archived: 0,
        featured: 0,
        byStatus: [],
        byIntent: [],
        byCategory: [],
      },
    };
  }
}

export async function getAdminProperty(propertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        slug: true,
        referenceNumber: true,
        title: true,
        description: true,
        intent: true,
        category: true,
        otherPropertyType: true,
        status: true,
        priceMinor: true,
        priceOnRequest: true,
        isNegotiable: true,
        areaValue: true,
        areaUnit: true,
        addressLine: true,
        localityName: true,
        city: true,
        state: true,
        postalCode: true,
        bedrooms: true,
        bathrooms: true,
        floors: true,
        furnishing: true,
        possession: true,
        amenities: true,
        highlights: true,
        isFeatured: true,
        featuredRank: true,
        seoTitle: true,
        seoDescription: true,
        publishedAt: true,
        updatedAt: true,
        owner: { select: { displayName: true, email: true } },
        media: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          select: {
            id: true,
            storagePath: true,
            altText: true,
            sortOrder: true,
            isCover: true,
            width: true,
            height: true,
          },
        },
      },
    });
    if (!property) return null;
    return {
      ...property,
      priceRupees:
        property.priceMinor === null
          ? ""
          : (property.priceMinor / BigInt(100)).toString(),
      priceMinor: undefined,
      areaValue: property.areaValue?.toString() ?? "",
      media: property.media.map((item) => ({
        ...item,
        publicUrl: getPublicPropertyMediaUrl(item.storagePath),
      })),
    };
  } catch {
    return null;
  }
}

async function requirePropertyManager(
  transaction: Prisma.TransactionClient,
  actorId: string,
) {
  const actor = await transaction.profile.findUnique({
    where: { id: actorId },
    select: { role: true, status: true },
  });
  if (
    !actor ||
    actor.status !== ProfileStatus.ACTIVE ||
    !canManagePropertyInventory(actor.role as ProfileRole)
  ) {
    throw new Error(
      "Only active administrators can manage property inventory.",
    );
  }
}

export async function updateAdminPropertyStatus(
  actorId: string,
  propertyId: string,
  nextStatus: PropertyStatus,
) {
  return prisma.$transaction(async (transaction) => {
    await requirePropertyManager(transaction, actorId);
    const property = await transaction.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
        _count: { select: { media: true } },
      },
    });
    if (!property) throw new Error("Property not found.");
    assertPropertyStatusTransition(property.status, nextStatus);
    if (nextStatus === PropertyStatus.PUBLISHED && property._count.media < 1) {
      throw new Error("Add at least one public image before publishing.");
    }
    const updated = await transaction.property.update({
      where: { id: property.id },
      data: {
        status: nextStatus,
        publishedAt:
          nextStatus === PropertyStatus.PUBLISHED
            ? (property.publishedAt ?? new Date())
            : property.publishedAt,
        ...(nextStatus !== PropertyStatus.PUBLISHED
          ? { isFeatured: false, featuredRank: null }
          : {}),
      },
      select: { id: true, status: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "PROPERTY_STATUS_CHANGED",
        entityType: "Property",
        entityId: property.id,
        summary: `Changed ${property.title} from ${property.status} to ${nextStatus}`,
        metadata: { previousStatus: property.status, nextStatus },
      },
    });
    return updated;
  });
}

export async function updateAdminPropertyFeatured(
  actorId: string,
  propertyId: string,
  isFeatured: boolean,
  featuredRank?: number | null,
) {
  return prisma.$transaction(async (transaction) => {
    await requirePropertyManager(transaction, actorId);
    const property = await transaction.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        status: true,
        isFeatured: true,
        featuredRank: true,
      },
    });
    if (!property) throw new Error("Property not found.");
    if (isFeatured && property.status !== PropertyStatus.PUBLISHED) {
      throw new Error("Only published properties can be featured.");
    }
    const updated = await transaction.property.update({
      where: { id: property.id },
      data: {
        isFeatured,
        featuredRank: isFeatured ? (featuredRank ?? 1) : null,
      },
      select: { id: true, isFeatured: true, featuredRank: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "PROPERTY_FEATURE_CHANGED",
        entityType: "Property",
        entityId: property.id,
        summary: `${isFeatured ? "Featured" : "Unfeatured"} ${property.title}`,
        metadata: {
          previousFeatured: property.isFeatured,
          previousRank: property.featuredRank,
          nextFeatured: isFeatured,
          nextRank: updated.featuredRank,
        },
      },
    });
    return updated;
  });
}

function optionalInteger(value: string) {
  return value === "" ? null : Number.parseInt(value, 10);
}

export async function updateAdminPropertyDetails(
  actorId: string,
  propertyId: string,
  input: PropertyDetailsUpdate,
) {
  return prisma.$transaction(async (transaction) => {
    await requirePropertyManager(transaction, actorId);
    const property = await transaction.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true },
    });
    if (!property) throw new Error("Property not found.");
    const updated = await transaction.property.update({
      where: { id: property.id },
      data: {
        title: input.title,
        description: input.description,
        intent: input.intent,
        category: input.category,
        otherPropertyType:
          input.category === "OTHER" ? input.otherPropertyType : null,
        priceMinor:
          input.priceOnRequest || input.priceRupees === ""
            ? null
            : BigInt(input.priceRupees) * BigInt(100),
        priceOnRequest: input.priceOnRequest,
        isNegotiable: input.isNegotiable,
        areaValue:
          input.areaValue === "" ? null : new Prisma.Decimal(input.areaValue),
        areaUnit: input.areaUnit || null,
        addressLine: input.addressLine || null,
        localityName: input.localityName,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode || null,
        bedrooms: optionalInteger(input.bedrooms),
        bathrooms: optionalInteger(input.bathrooms),
        floors: optionalInteger(input.floors),
        furnishing: input.furnishing || null,
        possession: input.possession || null,
        amenities: input.amenities,
        highlights: input.highlights,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
      },
      select: { id: true, slug: true, title: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId,
        action: "PROPERTY_DETAILS_UPDATED",
        entityType: "Property",
        entityId: property.id,
        summary: `Updated listing details for ${updated.title}`,
        metadata: { previousTitle: property.title, nextTitle: updated.title },
      },
    });
    return updated;
  });
}

// Temporary compatibility for existing imports while the inventory page migrates.
export async function getAdminProperties() {
  const result = await getAdminPropertyInventory();
  return { connected: result.connected, properties: result.properties };
}
