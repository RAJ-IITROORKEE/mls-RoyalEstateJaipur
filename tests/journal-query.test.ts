// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
const database = vi.hoisted(() => ({ blogPost: { findMany: vi.fn() } }));
vi.mock("@/lib/db/prisma", () => ({ prisma: database }));
import { getPublishedBlogPosts } from "@/features/blog/service";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("public journal projection", () => {
  it("uses bounded stable pagination and excludes author PII or draft content", async () => {
    vi.stubEnv("DATABASE_URL", "test");
    database.blogPost.findMany.mockResolvedValue(
      Array.from({ length: 13 }, (_, index) => ({
        id: String(index),
        title: "Guide",
        slug: `guide-${index}`,
        excerpt: "Published excerpt",
        readingMinutes: 3,
        publishedAt: new Date(),
        coverAsset: null,
      })),
    );
    const result = await getPublishedBlogPosts({ page: 2, limit: 100 });
    expect(result.posts).toHaveLength(12);
    expect(result.hasNextPage).toBe(true);
    expect(database.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED" },
        skip: 12,
        take: 13,
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      }),
    );
    const selection = database.blogPost.findMany.mock.calls[0][0].select;
    expect(selection).not.toHaveProperty("author");
    expect(selection).not.toHaveProperty("content");
    expect(selection).not.toHaveProperty("authorId");
  });
});
