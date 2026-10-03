import { PrismaClient } from "@prisma/client";

export async function seedCiFixtures(database: PrismaClient) {
  const ownerId = "622528db-b393-4094-937a-79ba36dfe1a3";
  await database.profile.upsert({
    where: { id: ownerId },
    create: {
      id: ownerId,
      email: "fixture-owner@example.test",
      displayName: "CI fixture owner",
    },
    update: {},
  });
  await database.locality.upsert({
    where: { slug: "fixture-jaipur" },
    create: {
      slug: "fixture-jaipur",
      name: "Fixture Jaipur",
      city: "Jaipur",
      state: "Rajasthan",
      summary: "Automated test locality.",
      isActive: true,
    },
    update: {},
  });
  await database.property.upsert({
    where: { slug: "ci-fixture-home" },
    create: {
      slug: "ci-fixture-home",
      referenceNumber: "CI-FIXTURE-001",
      ownerId,
      title: "CI fixture home in Jaipur",
      description: "Synthetic property used only by automated checks.",
      intent: "SELL",
      category: "RESIDENTIAL",
      status: "PUBLISHED",
      priceMinor: BigInt(10000000),
      areaValue: "1200",
      areaUnit: "SQ_FT",
      localityName: "Fixture Jaipur",
      city: "Jaipur",
      state: "Rajasthan",
      amenities: [],
      highlights: [],
      publishedAt: new Date(),
    },
    update: {},
  });
  for (const index of [1, 2])
    await database.blogPost.upsert({
      where: { slug: `ci-fixture-guide-${index}` },
      create: {
        slug: `ci-fixture-guide-${index}`,
        authorId: ownerId,
        title: `CI fixture property guide ${index}`,
        excerpt: "Synthetic article used only by automated checks.",
        content: {
          version: 1,
          blocks: [
            {
              type: "paragraph",
              text: "This is an automated test fixture, not production content.",
            },
          ],
        },
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      update: {},
    });
}

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (
    process.env.CI !== "true" ||
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    url.pathname !== "/test"
  )
    throw new Error(
      "CI fixture seeding requires the isolated local test database.",
    );
  const database = new PrismaClient();
  try {
    await seedCiFixtures(database);
  } finally {
    await database.$disconnect();
  }
}

if (process.argv.includes("--run"))
  main().catch(() => {
    console.error(
      "CI fixture seeding failed; no production database is supported.",
    );
    process.exitCode = 1;
  });
