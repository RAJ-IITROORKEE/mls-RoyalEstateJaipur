import { z } from "zod";

export const blogFontSizes = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
] as const;
export const blogTextColors = [
  "#1f3b31",
  "#4b5d55",
  "#8a5a2b",
  "#9f2d2d",
  "#255f85",
] as const;
export const blogHighlightColors = [
  "#f5e7b8",
  "#dcebd9",
  "#dce8f2",
  "#f3d9d5",
] as const;
export const blogAlignments = ["left", "center", "right"] as const;

export const legacyBlogBlockSchema = z
  .object({
    type: z.enum(["paragraph", "heading", "quote", "bulletList"]),
    text: z.string().trim().min(1).max(5000),
  })
  .strict();

export const legacyBlogContentSchema = z
  .object({
    version: z.literal(1),
    blocks: z.array(legacyBlogBlockSchema).min(1).max(100),
  })
  .strict();

export type BlogRichMark = {
  type:
    | "bold"
    | "italic"
    | "underline"
    | "strike"
    | "link"
    | "textStyle"
    | "highlight";
  attrs?: Record<string, unknown>;
};

export type BlogRichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: BlogRichMark[];
  content?: BlogRichNode[];
};

export type BlogRichContent = {
  version: 2;
  doc: BlogRichNode;
};

const allowedNodeTypes = new Set([
  "doc",
  "paragraph",
  "heading",
  "text",
  "blockquote",
  "bulletList",
  "orderedList",
  "listItem",
  "horizontalRule",
  "managedImage",
]);
const allowedSimpleMarks = new Set(["bold", "italic", "underline", "strike"]);
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeLink(value: unknown) {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function validateMarks(marks: unknown) {
  if (marks === undefined) return true;
  if (!Array.isArray(marks) || marks.length > 8) return false;
  const seen = new Set<string>();
  for (const mark of marks) {
    if (!isRecord(mark) || typeof mark.type !== "string" || seen.has(mark.type))
      return false;
    seen.add(mark.type);
    if (allowedSimpleMarks.has(mark.type) && mark.attrs === undefined) continue;
    if (!isRecord(mark.attrs)) return false;
    const attributeKeys = Object.keys(mark.attrs);
    if (
      mark.type === "link" &&
      attributeKeys.every((key) =>
        ["href", "target", "rel", "class"].includes(key),
      ) &&
      isSafeLink(mark.attrs.href) &&
      (mark.attrs.target === undefined ||
        mark.attrs.target === null ||
        mark.attrs.target === "_blank")
    )
      continue;
    if (
      mark.type === "textStyle" &&
      attributeKeys.every((key) => ["fontSize", "color"].includes(key)) &&
      (mark.attrs.fontSize === undefined ||
        mark.attrs.fontSize === null ||
        blogFontSizes.includes(
          mark.attrs.fontSize as (typeof blogFontSizes)[number],
        )) &&
      (mark.attrs.color === undefined ||
        mark.attrs.color === null ||
        blogTextColors.includes(
          mark.attrs.color as (typeof blogTextColors)[number],
        ))
    )
      continue;
    if (
      mark.type === "highlight" &&
      attributeKeys.every((key) => key === "color") &&
      blogHighlightColors.includes(
        mark.attrs.color as (typeof blogHighlightColors)[number],
      )
    )
      continue;
    return false;
  }
  return true;
}

function validateRichContent(value: unknown) {
  if (!isRecord(value) || value.version !== 2 || !isRecord(value.doc))
    return false;
  let nodeCount = 0;
  let textLength = 0;
  let imageCount = 0;

  function visit(node: unknown, depth: number): boolean {
    if (!isRecord(node) || depth > 8 || typeof node.type !== "string")
      return false;
    if (!allowedNodeTypes.has(node.type)) return false;
    nodeCount += 1;
    if (nodeCount > 2000) return false;
    if (node.type === "text") {
      if (
        typeof node.text !== "string" ||
        node.text.length > 5000 ||
        !validateMarks(node.marks)
      )
        return false;
      textLength += node.text.length;
      return textLength <= 100_000;
    }
    if (node.marks !== undefined || node.text !== undefined) return false;
    if (node.type === "heading") {
      if (
        !isRecord(node.attrs) ||
        ![2, 3, 4].includes(Number(node.attrs.level))
      )
        return false;
    }
    if (
      ["paragraph", "heading"].includes(node.type) &&
      node.attrs !== undefined
    ) {
      if (!isRecord(node.attrs)) return false;
      const alignment = node.attrs.textAlign;
      if (
        alignment !== undefined &&
        alignment !== null &&
        !blogAlignments.includes(alignment as (typeof blogAlignments)[number])
      )
        return false;
    }
    if (node.type === "managedImage") {
      imageCount += 1;
      if (imageCount > 40 || !isRecord(node.attrs)) return false;
      return (
        typeof node.attrs.assetId === "string" &&
        uuidPattern.test(node.attrs.assetId) &&
        typeof node.attrs.alt === "string" &&
        node.attrs.alt.trim().length >= 3 &&
        node.attrs.alt.length <= 300 &&
        (node.attrs.caption === undefined ||
          (typeof node.attrs.caption === "string" &&
            node.attrs.caption.length <= 500)) &&
        node.attrs.src === undefined
      );
    }
    if (node.type === "horizontalRule") return node.content === undefined;
    if (node.content === undefined)
      return node.type === "paragraph" || node.type === "heading";
    if (!Array.isArray(node.content) || node.content.length > 200) return false;
    return node.content.every((child) => visit(child, depth + 1));
  }

  return value.doc.type === "doc" && visit(value.doc, 0) && nodeCount > 1;
}

export const blogRichContentSchema = z.custom<BlogRichContent>(
  validateRichContent,
  {
    message:
      "Blog content contains unsupported formatting or invalid media references.",
  },
);

export const blogContentSchema = z.union([
  legacyBlogContentSchema,
  blogRichContentSchema,
]);

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(5).max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  excerpt: z.string().trim().max(1000).optional().default(""),
  content: blogContentSchema,
  readingMinutes: z.coerce.number().int().min(1).max(600),
  seoTitle: z.string().trim().max(200).optional().default(""),
  seoDescription: z.string().trim().max(320).optional().default(""),
});

export const blogStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export function collectBlogAssetIds(content: BlogContent) {
  if (content.version === 1) return [];
  const ids = new Set<string>();
  const visit = (node: BlogRichNode) => {
    if (node.type === "managedImage" && typeof node.attrs?.assetId === "string")
      ids.add(node.attrs.assetId);
    node.content?.forEach(visit);
  };
  visit(content.doc);
  return [...ids];
}

export function hasMeaningfulBlogContent(content: BlogContent) {
  if (content.version === 1) return content.blocks.some((block) => block.text.trim().length > 0);
  let meaningful = false;
  const visit = (node: BlogRichNode) => {
    if (node.type === "managedImage" || (node.type === "text" && node.text?.trim()))
      meaningful = true;
    node.content?.forEach(visit);
  };
  visit(content.doc);
  return meaningful;
}

export function stripTransientBlogImageUrls(doc: BlogRichNode): BlogRichNode {
  return {
    ...doc,
    attrs:
      doc.type === "managedImage" && doc.attrs
        ? Object.fromEntries(
            Object.entries(doc.attrs).filter(([key]) => key !== "src"),
          )
        : doc.attrs,
    content: doc.content?.map(stripTransientBlogImageUrls),
  };
}

export type LegacyBlogContent = z.infer<typeof legacyBlogContentSchema>;
export type BlogContent = LegacyBlogContent | BlogRichContent;
export type BlogBlock = z.infer<typeof legacyBlogBlockSchema>;
