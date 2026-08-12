import {
  EnquiryType,
  Prisma,
  PropertyCategory,
  PropertyIntent,
  PropertyStatus,
  SubmissionStatus,
  ProfileRole,
} from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { siteSettingDefaults } from "@/features/admin/settings";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const demoOwnerId = process.env.DEMO_OWNER_ID;
const demoOwnerEmail = process.env.DEMO_OWNER_EMAIL;
const demoOwnerIdSchema = z.string().uuid();

async function seedSettings() {
  const settings = Object.entries(siteSettingDefaults).map(([key, setting]) => ({ key, ...setting }));

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
        isPublic: setting.isPublic,
      },
      create: setting,
    });
  }
  return settings.length;
}

async function seedDemoContent() {
  if (
    process.env.SEED_DEMO_CONTENT !== "true" ||
    !demoOwnerId ||
    !demoOwnerEmail
  ) {
    console.info(
      "Demo content skipped. Set SEED_DEMO_CONTENT=true, DEMO_OWNER_ID, and DEMO_OWNER_EMAIL to opt in.",
    );
    return false;
  }
  const ownerId = demoOwnerIdSchema.parse(demoOwnerId);
  const localityId = "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c101";
  const submissionId = "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c102";
  const propertyId = "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c103";
  const enquiryId = "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c104";
  const notificationId = "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c105";
  const nearbyLocalities = [
    {
      id: "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c106",
      slug: "demo-malviya-nagar",
      name: "Malviya Nagar",
    },
    {
      id: "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c107",
      slug: "demo-jagatpura",
      name: "Jagatpura",
    },
    {
      id: "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c108",
      slug: "demo-mansarovar",
      name: "Mansarovar",
    },
  ] as const;

  await prisma.$transaction(async (transaction) => {
    await transaction.profile.upsert({
      where: { id: ownerId },
      update: {
        email: demoOwnerEmail,
        displayName: "Demo Owner",
        role: ProfileRole.USER,
        status: "ACTIVE",
      },
      create: {
        id: ownerId,
        email: demoOwnerEmail,
        displayName: "Demo Owner",
        role: ProfileRole.USER,
      },
    });
    await transaction.locality.upsert({
      where: { slug: "demo-vaishali-nagar" },
      update: {},
      create: {
        id: localityId,
        slug: "demo-vaishali-nagar",
        name: "Vaishali Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        summary: "Demo locality content for non-production review.",
        isFeatured: true,
      },
    });
    for (const locality of nearbyLocalities)
      await transaction.locality.upsert({
        where: { slug: locality.slug },
        update: {},
        create: {
          id: locality.id,
          slug: locality.slug,
          name: locality.name,
          city: "Jaipur",
          state: "Rajasthan",
          summary: "Demo locality content for non-production review.",
          isFeatured: false,
        },
      });
    const payload = {
      intent: "SELL",
      category: "RESIDENTIAL",
      title: "Demo courtyard home in Vaishali Nagar",
      description:
        "Seeded demo content for reviewing the catalogue and moderation workflow.",
      localityName: "Vaishali Nagar",
      city: "Jaipur",
      state: "Rajasthan",
      postalCode: "302021",
      priceMinor: "1250000000",
      priceOnRequest: false,
      isNegotiable: true,
      areaValue: "2400",
      areaUnit: "SQ_FT",
      bedrooms: 3,
      bathrooms: 3,
      floors: 2,
      furnishing: "Semi-furnished",
      possession: "Ready",
      amenities: ["Parking", "Garden"],
      highlights: ["Demo record", "Review before production use"],
      ownerPhone: "910000000000",
      consent: true,
    } satisfies Prisma.InputJsonValue;
    await transaction.propertySubmission.upsert({
      where: { id: submissionId },
      update: {
        ownerId,
        status: SubmissionStatus.APPROVED,
        payload,
        intent: PropertyIntent.SELL,
        category: PropertyCategory.RESIDENTIAL,
      },
      create: {
        id: submissionId,
        ownerId,
        referenceNumber: "RSJ-DEMO-0001",
        intent: PropertyIntent.SELL,
        category: PropertyCategory.RESIDENTIAL,
        status: SubmissionStatus.APPROVED,
        payload,
        reviewedAt: new Date(),
      },
    });
    await transaction.property.upsert({
      where: { sourceSubmissionId: submissionId },
      update: {
        status: PropertyStatus.PUBLISHED,
        isModerated: true,
        isVerified: false,
      },
      create: {
        id: propertyId,
        sourceSubmissionId: submissionId,
        ownerId,
        localityId,
        slug: "demo-courtyard-home-vaishali-nagar-rsj-demo-0001",
        referenceNumber: "RSJ-DEMO-0001",
        title: "Demo courtyard home in Vaishali Nagar",
        description:
          "Seeded demo content for reviewing the catalogue and moderation workflow.",
        intent: PropertyIntent.SELL,
        category: PropertyCategory.RESIDENTIAL,
        status: PropertyStatus.PUBLISHED,
        isModerated: true,
        priceMinor: BigInt(1250000000),
        priceOnRequest: false,
        isNegotiable: true,
        areaValue: "2400",
        areaUnit: "SQ_FT",
        localityName: "Vaishali Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        postalCode: "302021",
        bedrooms: 3,
        bathrooms: 3,
        floors: 2,
        furnishing: "Semi-furnished",
        possession: "Ready",
        amenities: ["Parking", "Garden"],
        highlights: ["Demo record", "Review before production use"],
        publishedAt: new Date(),
      },
    });
    const nearbyProperties = [
      {
        id: "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c109",
        localityId: nearbyLocalities[0].id,
        localityName: nearbyLocalities[0].name,
        slug: "demo-modern-flat-malviya-nagar-rsj-demo-0002",
        referenceNumber: "RSJ-DEMO-0002",
        title: "Demo modern flat in Malviya Nagar",
        priceMinor: BigInt(850000000),
        areaValue: "1450",
        bedrooms: 2,
        bathrooms: 2,
      },
      {
        id: "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c110",
        localityId: nearbyLocalities[1].id,
        localityName: nearbyLocalities[1].name,
        slug: "demo-garden-home-jagatpura-rsj-demo-0003",
        referenceNumber: "RSJ-DEMO-0003",
        title: "Demo garden home in Jagatpura",
        priceMinor: BigInt(975000000),
        areaValue: "1800",
        bedrooms: 3,
        bathrooms: 2,
      },
      {
        id: "d5a3f5d4-4b25-4e94-9c44-1bcdb2e8c111",
        localityId: nearbyLocalities[2].id,
        localityName: nearbyLocalities[2].name,
        slug: "demo-commercial-space-mansarovar-rsj-demo-0004",
        referenceNumber: "RSJ-DEMO-0004",
        title: "Demo commercial space in Mansarovar",
        priceMinor: BigInt(2100000000),
        areaValue: "3200",
        bedrooms: null,
        bathrooms: null,
      },
    ] as const;
    for (const listing of nearbyProperties)
      await transaction.property.upsert({
        where: { id: listing.id },
        update: {
          title: listing.title,
          priceMinor: listing.priceMinor,
          status: PropertyStatus.PUBLISHED,
          isModerated: true,
        },
        create: {
          id: listing.id,
          ownerId,
          localityId: listing.localityId,
          slug: listing.slug,
          referenceNumber: listing.referenceNumber,
          title: listing.title,
          description:
            "Seeded Jaipur demo content for reviewing the catalogue. No image media is attached to this record.",
          intent: PropertyIntent.SELL,
          category:
            listing.bedrooms === null
              ? PropertyCategory.COMMERCIAL
              : PropertyCategory.RESIDENTIAL,
          status: PropertyStatus.PUBLISHED,
          isModerated: true,
          priceMinor: listing.priceMinor,
          priceOnRequest: false,
          isNegotiable: true,
          areaValue: listing.areaValue,
          areaUnit: "SQ_FT",
          localityName: listing.localityName,
          city: "Jaipur",
          state: "Rajasthan",
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          amenities: [],
          highlights: ["Demo record", "No image media attached"],
          publishedAt: new Date(),
        },
      });
    await transaction.enquiry.upsert({
      where: { id: enquiryId },
      update: {
        propertyId,
        contactName: "Demo Enquirer",
        email: "demo-enquirer@example.com",
        message: "This is a seeded enquiry for operations review.",
        type: EnquiryType.PROPERTY,
        consentAt: new Date(),
      },
      create: {
        id: enquiryId,
        propertyId,
        contactName: "Demo Enquirer",
        email: "demo-enquirer@example.com",
        message: "This is a seeded enquiry for operations review.",
        type: EnquiryType.PROPERTY,
        consentAt: new Date(),
        source: "seed",
      },
    });
    await transaction.notification.upsert({
      where: { id: notificationId },
      update: {
        recipientId: ownerId,
        title: "Demo submission ready",
        body: "This seeded notification is for non-production review.",
        type: "DEMO",
      },
      create: {
        id: notificationId,
        recipientId: ownerId,
        title: "Demo submission ready",
        body: "This seeded notification is for non-production review.",
        type: "DEMO",
        entityType: "PropertySubmission",
        entityId: submissionId,
      },
    });
  });
  return true;
}

async function main() {
  const settingCount = await seedSettings();
  const demoSeeded = await seedDemoContent();
  console.info(
    `Seeded ${settingCount} safe settings${demoSeeded ? " and guarded demo content" : ""}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
