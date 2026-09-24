import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: { blogPost: { findMany: vi.fn(), findFirst: vi.fn() } },
}));

import {
  blogContentSchema,
  blogPostInputSchema,
} from "@/features/blog/schemas";
import {
  canManageBlog,
  getPublishedBlogPost,
  getPublishedBlogPosts,
} from "@/features/blog/service";
import { auditArchiveSchema } from "@/features/admin/audit-schema";
import { prisma } from "@/lib/db/prisma";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("blog content boundaries", () => {
  it("accepts allowlisted editorial blocks and rejects empty content", () => {
    expect(
      blogContentSchema.safeParse({
        version: 1,
        blocks: [{ type: "heading", text: "Buying in Jaipur" }],
      }).success,
    ).toBe(true);
    expect(
      blogContentSchema.safeParse({ version: 1, blocks: [] }).success,
    ).toBe(false);
    expect(
      blogPostInputSchema.safeParse({
        title: "A considered guide to buying",
        slug: "buying-in-jaipur",
        content: {
          version: 1,
          blocks: [{ type: "paragraph", text: "Start with the locality." }],
        },
        readingMinutes: 4,
      }).success,
    ).toBe(true);
  });

  it("limits blog management to staff roles", () => {
    expect(canManageBlog("REVIEWER")).toBe(true);
    expect(canManageBlog("ADMIN")).toBe(true);
    expect(canManageBlog("USER")).toBe(false);
  });

  it("accepts versioned rich content and rejects transient or unsafe attributes", () => {
    const richContent = {
      version: 2,
      doc: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "left" },
            content: [{ type: "text", text: "A clearer property decision", marks: [{ type: "bold" }] }],
          },
          {
            type: "managedImage",
            attrs: {
              assetId: "00000000-0000-4000-8000-000000000001",
              alt: "A sunlit Jaipur courtyard",
              caption: "Courtyard planning notes",
            },
          },
        ],
      },
    };
    expect(blogContentSchema.safeParse(richContent).success).toBe(true);
    expect(
      blogContentSchema.safeParse({
        ...richContent,
        doc: {
          ...richContent.doc,
          content: [
            {
              type: "managedImage",
              attrs: {
                assetId: "00000000-0000-4000-8000-000000000001",
                alt: "A sunlit Jaipur courtyard",
                src: "https://signed.example/private-token",
              },
            },
          ],
        },
      }).success,
    ).toBe(false);
    expect(
      blogContentSchema.safeParse({
        version: 2,
        doc: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Unsafe link",
                  marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
                },
              ],
            },
          ],
        },
      }).success,
    ).toBe(false);
  });
});

describe("public blog database failures", () => {
  it("returns an unavailable result when the list query cannot connect", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://unavailable");
    vi.mocked(prisma.blogPost.findMany).mockRejectedValue(
      new Error("PrismaClientInitializationError: connection details"),
    );

    await expect(getPublishedBlogPosts()).resolves.toEqual({
      connected: false,
      posts: [],
    });
  });

  it("returns an unavailable result for a failed detail query", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://unavailable");
    vi.mocked(prisma.blogPost.findFirst).mockRejectedValue(
      new Error("PrismaClientInitializationError: connection details"),
    );

    await expect(getPublishedBlogPost("sample-story")).resolves.toEqual({
      connected: false,
      post: null,
    });
  });
});

describe("audit archive boundary", () => {
  it("requires a valid audit id and reason", () => {
    expect(
      auditArchiveSchema.safeParse({ auditLogId: "not-an-id", reason: "hide" })
        .success,
    ).toBe(false);
    expect(
      auditArchiveSchema.safeParse({
        auditLogId: "00000000-0000-0000-0000-000000000000",
        reason: "Operational cleanup",
      }).success,
    ).toBe(true);
  });
});
