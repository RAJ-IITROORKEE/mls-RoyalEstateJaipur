import { config } from "dotenv";
import { resolve } from "node:path";

import { prisma } from "@/lib/db/prisma";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const settingCount = await prisma.siteSetting.count();
  console.info(`Database connection OK. Site settings available: ${settingCount}.`);
}

main()
  .catch(() => {
    console.error("Database connection failed.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
