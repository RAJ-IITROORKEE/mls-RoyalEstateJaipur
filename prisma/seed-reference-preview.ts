import {
  BlogStatus,
  Prisma,
  ProfileRole,
  ProfileStatus,
  PropertyCategory,
  PropertyIntent,
  PropertyStatus,
} from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "node:path";

import { blogContentSchema } from "../features/blog/schemas";
import { prisma } from "../lib/db/prisma";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const referencePreviewProperties = [
  {
    slug: "preview-111-sq-yd-west-facing-plot-jagatpura",
    referenceNumber: "RSJ-PREVIEW-0001",
    title: "111 sq yd residential plot in Jagatpura",
    description:
      "Preview listing assembled from public reference facts for layout review. Royal Estates has not verified the owner, current availability, price, measurements, or approvals. Replace this preview and add authorized property photos before presenting it as live inventory.",
    intent: PropertyIntent.SELL,
    category: PropertyCategory.PLOT,
    priceMinor: BigInt("765900000"),
    areaValue: "111",
    areaUnit: "SQ_YD",
    localityName: "Jagatpura II",
    highlights: ["West-facing per reference listing", "Preview data — confirm before use"],
  },
  {
    slug: "preview-169-sq-yd-plot-garden-city-jagatpura",
    referenceNumber: "RSJ-PREVIEW-0002",
    title: "169 sq yd residential plot in Garden City",
    description:
      "Preview listing assembled from public reference facts for layout review. Royal Estates has not verified the owner, current availability, price, measurements, or approvals. Replace this preview and add authorized property photos before presenting it as live inventory.",
    intent: PropertyIntent.SELL,
    category: PropertyCategory.PLOT,
    priceMinor: BigInt("1220000000"),
    areaValue: "169",
    areaUnit: "SQ_YD",
    localityName: "Jagatpura II",
    highlights: ["South-west facing per reference listing", "Preview data — confirm before use"],
  },
  {
    slug: "preview-3-bhk-villa-rent-saligrampura",
    referenceNumber: "RSJ-PREVIEW-0003",
    title: "3 BHK villa for rent in Saligrampura",
    description:
      "Preview rental listing assembled from public reference facts for layout review. Royal Estates has not verified the owner, current availability, rent, furnishings, or terms. Confirm the complete rental conditions and replace this preview before presenting it as live inventory.",
    intent: PropertyIntent.RENT,
    category: PropertyCategory.RESIDENTIAL,
    priceMinor: BigInt("14900000"),
    areaValue: "3000",
    areaUnit: "SQ_FT",
    localityName: "Jagatpura II",
    bedrooms: 3,
    highlights: ["West-facing per reference listing", "Rent amount shown per month in source", "Preview data — confirm before use"],
  },
  {
    slug: "preview-627-sq-m-commercial-plot-ring-road",
    referenceNumber: "RSJ-PREVIEW-0004",
    title: "627 sq m commercial plot on Ring Road",
    description:
      "Preview commercial listing assembled from public reference facts for layout review. Royal Estates has not verified the owner, current availability, price, measurements, or approvals. Replace this preview and add authorized property photos before presenting it as live inventory.",
    intent: PropertyIntent.SELL,
    category: PropertyCategory.COMMERCIAL,
    priceMinor: BigInt("3760000000"),
    areaValue: "627",
    areaUnit: "SQ_M",
    localityName: "Ring Road",
    highlights: ["South and north facing per reference listing", "Preview data — confirm before use"],
  },
  {
    slug: "preview-333-sq-yd-commercial-plot-jagatpura",
    referenceNumber: "RSJ-PREVIEW-0005",
    title: "333 sq yd commercial plot in Jagatpura",
    description:
      "Preview commercial listing assembled from public reference facts for layout review. Royal Estates has not verified the owner, current availability, price, measurements, or approvals. Replace this preview and add authorized property photos before presenting it as live inventory.",
    intent: PropertyIntent.SELL,
    category: PropertyCategory.COMMERCIAL,
    priceMinor: BigInt("4330000000"),
    areaValue: "333",
    areaUnit: "SQ_YD",
    localityName: "Jagatpura II",
    highlights: ["South-west facing per reference listing", "Preview data — confirm before use"],
  },
] as const;

const articleContent = (sections: { heading: string; paragraphs: string[] }[]) =>
  ({
    version: 2,
    doc: {
      type: "doc",
      content: sections.flatMap(({ heading, paragraphs }) => [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: heading }],
        },
        ...paragraphs.map((text) => ({
          type: "paragraph",
          content: [{ type: "text", text }],
        })),
      ]),
    },
  }) satisfies Prisma.InputJsonValue;

const previewArticles = [
  {
    slug: "a-practical-checklist-for-shortlisting-a-home-in-jaipur",
    title: "A practical checklist for shortlisting a home in Jaipur",
    excerpt:
      "A simple way to compare location, costs, property details, and open questions before you arrange a visit.",
    readingMinutes: 4,
    seoTitle: "A practical Jaipur home-shortlisting checklist",
    seoDescription:
      "Compare a Jaipur property shortlist using consistent facts, useful questions, and a focused viewing plan.",
    content: articleContent([
      {
        heading: "Start with your non-negotiables",
        paragraphs: [
          "Write down the things a home must provide: a realistic budget, the areas you can consider, how many rooms you need, and any access requirements. Keep preferences such as a balcony or an extra room in a separate list so they do not distract from the essentials.",
          "A short brief makes it easier to compare listings against the same needs instead of choosing from whichever page has the most details.",
        ],
      },
      {
        heading: "Compare like with like",
        paragraphs: [
          "For each option, note the locality, total asking price, area and unit, layout, condition, furnishing, availability, and the facts you still need to confirm. A square-foot figure and a square-yard figure are not directly comparable until you convert them.",
          "Treat listing details as a starting point. Ask who supplied them and whether the latest price, measurements, and status have been checked.",
        ],
      },
      {
        heading: "Prepare for the visit",
        paragraphs: [
          "Before travelling, confirm the exact address, access instructions, availability, and any costs that are not included in the asking price. At the property, check light, ventilation, water, noise, access, and the condition of items that matter to you.",
          "Keep a note of unanswered questions and request supporting documents through a trusted channel. A visit or enquiry starts a conversation; it does not reserve a property.",
        ],
      },
    ]),
  },
  {
    slug: "what-to-confirm-before-viewing-a-rental-home",
    title: "What to confirm before viewing a rental home",
    excerpt:
      "Make a rental visit more useful by checking the terms, practical details, and questions that affect your move.",
    readingMinutes: 3,
    seoTitle: "Questions to ask before viewing a rental home",
    seoDescription:
      "A practical checklist for confirming rental terms, property condition, access, and next steps before a home visit.",
    content: articleContent([
      {
        heading: "Get the terms in writing",
        paragraphs: [
          "Ask for the rent amount and payment frequency, deposit, maintenance charges, included utilities, expected move-in date, and any minimum-stay conditions. Confirm which costs are fixed and which can change.",
          "If furniture or appliances are included, ask for an inventory and clarify who handles repairs. The written agreement should match the terms discussed before you commit.",
        ],
      },
      {
        heading: "Use the viewing to check daily life",
        paragraphs: [
          "Look at water pressure, ventilation, natural light, phone reception, storage, locks, and the condition of doors and windows. Check shared access and parking arrangements if you need them.",
          "Consider the route to work, study, shops, and regular services at the times you would normally travel. A location can feel different during a short daytime visit than it does during your usual routine.",
        ],
      },
      {
        heading: "Agree on a clear next step",
        paragraphs: [
          "Before paying or sending identity documents, confirm who you are dealing with, what documentation is required, how your information will be used, and how any payment will be acknowledged.",
          "After the visit, compare the confirmed terms and property condition against your notes. Take time to resolve open questions before making a decision.",
        ],
      },
    ]),
  },
] as const;

function assertPreviewEnvironment() {
  if (process.env.SEED_REFERENCE_PREVIEW !== "true")
    throw new Error("Set SEED_REFERENCE_PREVIEW=true to run this preview seed.");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error("Set NEXT_PUBLIC_SITE_URL to a local URL first.");
  const hostname = new URL(siteUrl).hostname;
  if (hostname !== "localhost" && hostname !== "127.0.0.1")
    throw new Error("Preview content seed is restricted to localhost site URLs.");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for the preview seed.");
  const databaseHostname = new URL(databaseUrl).hostname;
  const localDatabase =
    databaseHostname === "localhost" || databaseHostname === "127.0.0.1";
  if (
    !localDatabase &&
    process.env.SEED_REFERENCE_PREVIEW_ALLOW_REMOTE !== "true"
  ) {
    throw new Error(
      "The database is remote. Set SEED_REFERENCE_PREVIEW_ALLOW_REMOTE=true only if you intend to publish these unverified preview records to it.",
    );
  }
}

async function seedReferencePreview() {
  assertPreviewEnvironment();
  const administrator = await prisma.profile.findFirst({
    where: { role: ProfileRole.SUPER_ADMIN, status: ProfileStatus.ACTIVE },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!administrator)
    throw new Error("An active super-admin profile is required for this preview seed.");

  const publishedAt = new Date("2026-09-25T12:00:00.000Z");
  const validatedArticles = previewArticles.map((article) => {
    blogContentSchema.parse(article.content);
    return article;
  });

  for (const listing of referencePreviewProperties) {
    const locality = await prisma.locality.findFirst({
      where: { name: listing.localityName, city: "Jaipur", isActive: true },
      select: { id: true },
    });
    await prisma.property.upsert({
        where: { slug: listing.slug },
        update: {
          ownerId: administrator.id,
          localityId: locality?.id ?? null,
          title: listing.title,
          description: listing.description,
          intent: listing.intent,
          category: listing.category,
          status: PropertyStatus.PUBLISHED,
          isModerated: true,
          isVerified: false,
          priceMinor: listing.priceMinor,
          priceOnRequest: false,
          areaValue: listing.areaValue,
          areaUnit: listing.areaUnit,
          localityName: listing.localityName,
          city: "Jaipur",
          state: "Rajasthan",
          bedrooms: "bedrooms" in listing ? listing.bedrooms : null,
          highlights: [...listing.highlights],
          seoTitle: `Preview: ${listing.title}`,
          seoDescription:
            "Reference data for a local UI preview only. Availability, ownership, price, and approvals have not been verified by Royal Estates.",
          publishedAt,
        },
        create: {
          ownerId: administrator.id,
          localityId: locality?.id ?? null,
          slug: listing.slug,
          referenceNumber: listing.referenceNumber,
          title: listing.title,
          description: listing.description,
          intent: listing.intent,
          category: listing.category,
          status: PropertyStatus.PUBLISHED,
          isModerated: true,
          isVerified: false,
          priceMinor: listing.priceMinor,
          priceOnRequest: false,
          areaValue: listing.areaValue,
          areaUnit: listing.areaUnit,
          localityName: listing.localityName,
          city: "Jaipur",
          state: "Rajasthan",
          bedrooms: "bedrooms" in listing ? listing.bedrooms : null,
          amenities: [],
          highlights: [...listing.highlights],
          seoTitle: `Preview: ${listing.title}`,
          seoDescription:
            "Reference data for a local UI preview only. Availability, ownership, price, and approvals have not been verified by Royal Estates.",
          publishedAt,
        },
    });
  }

  for (const article of validatedArticles) {
    await prisma.blogPost.upsert({
        where: { slug: article.slug },
        update: {
          authorId: administrator.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          readingMinutes: article.readingMinutes,
          status: BlogStatus.PUBLISHED,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          publishedAt,
        },
        create: {
          authorId: administrator.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          readingMinutes: article.readingMinutes,
          status: BlogStatus.PUBLISHED,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          publishedAt,
        },
    });
  }

  console.info("Preview seed complete: 5 listings and 2 original journal articles.");
  console.info("The listings have no cover photos; upload media you are authorized to use before live publication.");
}

seedReferencePreview()
  .catch((error: unknown) => {
    console.error(
      "Preview seed failed:",
      error instanceof Error ? error.message : "Unexpected error.",
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
