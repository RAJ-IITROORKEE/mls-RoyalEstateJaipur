import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { seedCiFixtures } from "@/scripts/seed-ci";

async function main() {
  const privateConnection: unknown = JSON.parse(
    await readFile(resolve(".insforge/connection-private.json"), "utf8"),
  );
  const { connectionURL } = z
    .object({ connectionURL: z.string().url() })
    .parse(privateConnection);
  const schema = `phase1_qa_${randomUUID().replaceAll("-", "")}`;
  if (!/^phase1_qa_[a-f0-9]{32}$/.test(schema))
    throw new Error("Invalid test schema.");
  const direct = new PrismaClient({
    datasources: { db: { url: connectionURL } },
  });
  const url = new URL(connectionURL);
  url.searchParams.set("schema", schema);
  url.searchParams.set("connection_limit", "8");
  const testUrl = url.toString();
  let created = false;
  let database: PrismaClient | undefined;
  try {
    await direct.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    created = true;
    const migration = spawnSync(
      process.execPath,
      [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
      {
        env: { ...process.env, DATABASE_URL: testUrl, DIRECT_URL: testUrl },
        encoding: "utf8",
      },
    );
    if (migration.status !== 0) {
      await writeFile(
        resolve(".insforge/phase1-migrate-private.log"),
        `${migration.stdout ?? ""}\n${migration.stderr ?? ""}`,
      );
      console.info(
        "Migration diagnostic saved privately; codes:",
        (migration.stderr ?? "").match(
          /P\d{4}|Schema engine error|Migration failed/g,
        ) ?? [],
      );
      throw new Error("Test migrations failed.");
    }
    console.info("PASS: isolated migrations applied.");
    database = new PrismaClient({ datasources: { db: { url: testUrl } } });
    await seedCiFixtures(database);
    console.info("PASS: synthetic test fixtures created.");
    process.env.DATABASE_URL = testUrl;
    process.env.RATE_LIMIT_BACKEND = "database";
    const { prisma } = await import("@/lib/db/prisma");
    const { checkRateLimit } = await import("@/lib/security/rate-limit");
    const { createPublicEnquiry } = await import("@/features/enquiries/create");
    try {
      const counters = await Promise.all(
        Array.from({ length: 8 }, () =>
          checkRateLimit({ key: "qa-concurrency", limit: 3, windowMs: 60000 }),
        ),
      );
      console.info("PASS: concurrent counter requests finished.");
      if (counters.filter((value) => value.allowed).length !== 3)
        throw new Error("Counter concurrency failed.");
      const input = {
        contactName: "CI enquiry",
        email: "fixture-enquiry@example.test",
        message: "Isolated concurrency check.",
        consent: "on" as const,
        website: "",
      };
      await Promise.all(
        Array.from({ length: 6 }, () => createPublicEnquiry(input)),
      );
      if (
        (await database.enquiry.count({ where: { email: input.email } })) !== 1
      )
        throw new Error("Enquiry deduplication failed.");
      const countersHidden = await database.$queryRaw<
        { relrowsecurity: boolean }[]
      >`SELECT relrowsecurity FROM pg_class WHERE oid = '"RateLimitBucket"'::regclass`;
      if (!countersHidden[0]?.relrowsecurity)
        throw new Error("Counter RLS validation failed.");
      console.info(
        "PASS: all 9 migrations in an isolated schema; atomic counter (8 concurrent requests, 3 allowed); duplicate enquiry (6 concurrent requests, 1 row); counter RLS.",
      );
    } finally {
      await prisma.$disconnect();
    }
  } finally {
    await database?.$disconnect();
    // Only remove the unique schema this invocation created, after validating its name above.
    if (created) {
      await direct.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
      console.info("PASS: isolated test schema removed.");
    }
    await direct.$disconnect();
  }
}

main().catch(async (error: unknown) => {
  await writeFile(
    resolve(".insforge/phase1-validation-private.log"),
    error instanceof Error
      ? (error.stack ?? error.message)
      : "Unknown validation failure.",
  );
  console.error(
    "Phase 1 database validation failed; review the isolated validation steps without exposing credentials.",
  );
  process.exitCode = 1;
});
