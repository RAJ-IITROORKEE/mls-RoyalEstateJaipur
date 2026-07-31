import {
  Prisma,
  PropertyCategory,
  PropertyIntent,
  PropertyStatus,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { hasDatabaseConfiguration } from "@/lib/env";
import { getPublicPropertyMediaUrl } from "@/lib/supabase/public-url";

export type PublicPropertyCard = {
  slug: string;
  referenceNumber: string;
  title: string;
  intent: PropertyIntent;
  category: PropertyCategory;
  otherPropertyType: string | null;
  localityName: string;
  city: string;
  priceMinor: bigint | null;
  priceOnRequest: boolean;
  areaValue: string | null;
  areaUnit: string | null;
  coverImage: { altText: string; publicUrl: string | null } | null;
};

export type PublicPropertySort = "newest" | "price_asc" | "price_desc";

export type PublicPropertyResult = {
  connected: boolean;
  properties: PublicPropertyCard[];
  hasMore: boolean;
};

export type PublicPropertyFilters = {
  intent?: PropertyIntent;
  category?: PropertyCategory;
  query?: string;
  page?: number;
  minPriceMinor?: string;
  maxPriceMinor?: string;
  minArea?: string;
  maxArea?: string;
  bedrooms?: number;
  furnishing?: string;
  amenity?: string;
  sort?: PublicPropertySort;
  limit?: number;
};

const emptyResult: PublicPropertyResult = {
  connected: false,
  properties: [],
  hasMore: false,
};

export async function getPublishedProperties(
  filters: PublicPropertyFilters = {},
): Promise<PublicPropertyResult> {
  if (!hasDatabaseConfiguration()) return emptyResult;
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(48, Math.max(1, filters.limit ?? 24));
  const orderBy: Prisma.PropertyOrderByWithRelationInput[] =
    filters.sort === "price_asc"
      ? [{ priceMinor: "asc" }, { publishedAt: "desc" }]
      : filters.sort === "price_desc"
        ? [{ priceMinor: "desc" }, { publishedAt: "desc" }]
        : [{ isFeatured: "desc" }, { publishedAt: "desc" }];
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: PropertyStatus.PUBLISHED,
        ...(filters.intent ? { intent: filters.intent } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.query
          ? {
              OR: [
                {
                  localityName: {
                    contains: filters.query,
                    mode: "insensitive",
                  },
                },
                { city: { contains: filters.query, mode: "insensitive" } },
                { title: { contains: filters.query, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(filters.minPriceMinor || filters.maxPriceMinor
          ? {
              priceMinor: {
                gte: filters.minPriceMinor
                  ? BigInt(filters.minPriceMinor)
                  : undefined,
                lte: filters.maxPriceMinor
                  ? BigInt(filters.maxPriceMinor)
                  : undefined,
              },
            }
          : {}),
        ...(filters.minArea || filters.maxArea
          ? {
              areaValue: {
                gte: filters.minArea
                  ? new Prisma.Decimal(filters.minArea)
                  : undefined,
                lte: filters.maxArea
                  ? new Prisma.Decimal(filters.maxArea)
                  : undefined,
              },
            }
          : {}),
        ...(filters.bedrooms ? { bedrooms: { gte: filters.bedrooms } } : {}),
        ...(filters.furnishing
          ? { furnishing: { equals: filters.furnishing } }
          : {}),
        ...(filters.amenity ? { amenities: { has: filters.amenity } } : {}),
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit + 1,
      select: {
        slug: true,
        referenceNumber: true,
        title: true,
        intent: true,
        category: true,
        otherPropertyType: true,
        localityName: true,
        city: true,
        priceMinor: true,
        priceOnRequest: true,
        areaValue: true,
        areaUnit: true,
        media: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          take: 1,
          select: { storagePath: true, altText: true },
        },
      },
    });
    return {
      connected: true,
      properties: properties.slice(0, limit).map(({ media, ...property }) => ({
        ...property,
        areaValue: property.areaValue?.toString() ?? null,
        coverImage: media[0]
          ? {
              altText: media[0].altText,
              publicUrl: getPublicPropertyMediaUrl(media[0].storagePath),
            }
          : null,
      })),
      hasMore: properties.length > limit,
    };
  } catch {
    return emptyResult;
  }
}

export async function getPublishedProperty(slug: string) {
  if (!hasDatabaseConfiguration())
    return { connected: false as const, property: null };
  try {
    const property = await prisma.property.findFirst({
      where: { slug, status: PropertyStatus.PUBLISHED },
      select: {
        id: true,
        slug: true,
        referenceNumber: true,
        title: true,
        description: true,
        intent: true,
        category: true,
        otherPropertyType: true,
        localityName: true,
        city: true,
        state: true,
        postalCode: true,
        priceMinor: true,
        priceOnRequest: true,
        isNegotiable: true,
        areaValue: true,
        areaUnit: true,
        bedrooms: true,
        bathrooms: true,
        floors: true,
        furnishing: true,
        possession: true,
        amenities: true,
        highlights: true,
        media: {
          orderBy: { sortOrder: "asc" },
          select: {
            storagePath: true,
            altText: true,
            isCover: true,
            width: true,
            height: true,
          },
        },
      },
    });
    return {
      connected: true as const,
      property: property
        ? {
            ...property,
            media: property.media.map((media) => ({
              ...media,
              publicUrl: getPublicPropertyMediaUrl(media.storagePath),
            })),
          }
        : null,
    };
  } catch {
    return { connected: false as const, property: null };
  }
}

export async function getPublishedPropertySlugs() {
  if (!hasDatabaseConfiguration()) return [];
  try {
    const properties = await prisma.property.findMany({
      where: { status: PropertyStatus.PUBLISHED },
      select: { slug: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    });
    return properties.map(({ slug }) => slug);
  } catch {
    return [];
  }
}
