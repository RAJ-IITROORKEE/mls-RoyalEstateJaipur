import {
  stripTransientBlogImageUrls,
  type BlogContent,
  type BlogRichContent,
  type BlogRichNode,
  type LegacyBlogContent,
} from "@/features/blog/schemas";

export type BlogEditorAsset = {
  id: string;
  url: string | null;
  altText: string;
  caption: string | null;
  width: number | null;
  height: number | null;
};

export const emptyBlogRichContent: BlogRichContent = {
  version: 2,
  doc: { type: "doc", content: [{ type: "paragraph" }] },
};

function legacyBlockToNode(
  block: LegacyBlogContent["blocks"][number],
): BlogRichNode {
  const text = { type: "text", text: block.text } satisfies BlogRichNode;
  if (block.type === "heading")
    return {
      type: "heading",
      attrs: { level: 2, textAlign: "left" },
      content: [text],
    };
  if (block.type === "quote")
    return {
      type: "blockquote",
      content: [{ type: "paragraph", content: [text] }],
    };
  if (block.type === "bulletList")
    return {
      type: "bulletList",
      content: block.text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: item }] },
          ],
        })),
    };
  return { type: "paragraph", attrs: { textAlign: "left" }, content: [text] };
}

export function toBlogRichContent(
  content: BlogContent | unknown,
): BlogRichContent {
  if (
    content &&
    typeof content === "object" &&
    "version" in content &&
    content.version === 2 &&
    "doc" in content
  )
    return content as BlogRichContent;
  if (
    content &&
    typeof content === "object" &&
    "version" in content &&
    content.version === 1 &&
    "blocks" in content &&
    Array.isArray(content.blocks)
  ) {
    const legacy = content as LegacyBlogContent;
    return {
      version: 2,
      doc: { type: "doc", content: legacy.blocks.map(legacyBlockToNode) },
    };
  }
  return emptyBlogRichContent;
}

export function hydrateBlogImageUrls(
  node: BlogRichNode,
  assets: BlogEditorAsset[],
): BlogRichNode {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const visit = (current: BlogRichNode): BlogRichNode => {
    if (
      current.type === "managedImage" &&
      typeof current.attrs?.assetId === "string"
    ) {
      const asset = assetMap.get(current.attrs.assetId);
      return {
        ...current,
        attrs: {
          ...current.attrs,
          src: asset?.url ?? null,
          alt: current.attrs.alt ?? asset?.altText ?? "Blog image",
          caption: current.attrs.caption ?? asset?.caption ?? "",
        },
      };
    }
    return { ...current, content: current.content?.map(visit) };
  };
  return visit(node);
}

export function serializeBlogDocument(doc: BlogRichNode): BlogRichContent {
  return { version: 2, doc: stripTransientBlogImageUrls(doc) };
}
