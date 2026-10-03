// @vitest-environment node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

async function routeFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? routeFiles(join(directory, entry.name))
        : Promise.resolve(
            entry.name === "route.ts" ? [join(directory, entry.name)] : [],
          ),
    ),
  );
  return files.flat();
}

describe("API mutation inventory", () => {
  it("requires the shared request boundary on every cookie-auth mutation", async () => {
    const files = await routeFiles(join(process.cwd(), "app", "api"));
    let mutations = 0;
    for (const file of files) {
      const source = await readFile(file, "utf8");
      expect(source, file).not.toMatch(
        /export\s+(?:async\s+)?function\s+(?:POST|PATCH|PUT|DELETE)\b/,
      );
      for (const match of source.matchAll(
        /export\s+const\s+(POST|PATCH|PUT|DELETE)\s*=/g,
      )) {
        mutations += 1;
        expect(source.slice(match.index), file).toMatch(
          /^export\s+const\s+\w+\s*=\s*withMutationBoundary\(/,
        );
      }
    }
    expect(mutations).toBe(36);
  });
});
