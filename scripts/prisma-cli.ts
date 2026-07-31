import { config } from "dotenv";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Prisma does not load Next's .env.local convention by itself.
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const prismaCli = resolve(
  process.cwd(),
  "node_modules",
  "prisma",
  "build",
  "index.js",
);
const args = process.argv.slice(2);
const fromEnvIndex = args.indexOf("--from-url-env");
if (fromEnvIndex >= 0) {
  const envName = args[fromEnvIndex + 1];
  const url = envName ? process.env[envName] : undefined;
  if (!url) {
    console.error(`Missing database environment variable: ${envName ?? "unknown"}`);
    process.exit(1);
  }
  args.splice(fromEnvIndex, 2, "--from-url", url);
}

const result = spawnSync(process.execPath, [prismaCli, ...args], {
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error("Unable to start Prisma.");
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
