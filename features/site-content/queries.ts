import { prisma } from "@/lib/db/prisma";
import { hasDatabaseConfiguration } from "@/lib/env";
import {
  defaultFaqItems,
  defaultLocalities,
} from "@/features/site-content/default-content";

const fallbackLocalities = defaultLocalities.map(
  ({ name, slug, city, state, isFeatured, sortOrder }) => ({
    id: `default-${slug}`,
    name,
    slug,
    city,
    state,
    isFeatured,
    sortOrder,
  }),
);

export async function getPublicLocalities() {
  if (!hasDatabaseConfiguration())
    return { connected: false as const, localities: fallbackLocalities };

  try {
    const localities = await prisma.locality.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        isFeatured: true,
        sortOrder: true,
      },
    });
    return {
      connected: true as const,
      localities,
    };
  } catch {
    return { connected: false as const, localities: fallbackLocalities };
  }
}

export async function getPublicFaqItems() {
  if (!hasDatabaseConfiguration())
    return { connected: false as const, faqs: defaultFaqItems };

  try {
    const faqs = await prisma.faqItem.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, question: true, answer: true },
    });
    return {
      connected: true as const,
      faqs,
    };
  } catch {
    return { connected: false as const, faqs: defaultFaqItems };
  }
}

export async function getAdminSiteContent() {
  if (!hasDatabaseConfiguration())
    return { connected: false as const, faqs: [] };

  try {
    const faqs = await prisma.faqItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        key: true,
        question: true,
        answer: true,
        sortOrder: true,
        isPublished: true,
      },
    });
    return { connected: true as const, faqs };
  } catch {
    return { connected: false as const, faqs: [] };
  }
}
