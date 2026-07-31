import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import {
  toBlogRichContent,
  type BlogEditorAsset,
} from "@/features/blog/editor";
import type {
  BlogContent,
  BlogRichMark,
  BlogRichNode,
} from "@/features/blog/schemas";

function renderMarkedText(text: string, marks: BlogRichMark[] = []) {
  return marks.reduce<ReactNode>((content, mark, index) => {
    const key = `${mark.type}-${index}`;
    if (mark.type === "bold") return <strong key={key}>{content}</strong>;
    if (mark.type === "italic") return <em key={key}>{content}</em>;
    if (mark.type === "underline") return <u key={key}>{content}</u>;
    if (mark.type === "strike") return <s key={key}>{content}</s>;
    if (mark.type === "link")
      return (
        <a
          className="font-semibold text-primary underline underline-offset-4"
          href={String(mark.attrs?.href)}
          key={key}
          rel="noreferrer"
        >
          {content}
        </a>
      );
    if (mark.type === "textStyle")
      return (
        <span
          key={key}
          style={{
            color:
              typeof mark.attrs?.color === "string"
                ? mark.attrs.color
                : undefined,
            fontSize:
              typeof mark.attrs?.fontSize === "string"
                ? mark.attrs.fontSize
                : undefined,
          }}
        >
          {content}
        </span>
      );
    if (mark.type === "highlight")
      return (
        <mark key={key} style={{ backgroundColor: String(mark.attrs?.color) }}>
          {content}
        </mark>
      );
    return content;
  }, text);
}

function BlogNode({
  node,
  assets,
  path,
}: {
  node: BlogRichNode;
  assets: Map<string, BlogEditorAsset>;
  path: string;
}) {
  if (node.type === "text")
    return <>{renderMarkedText(node.text ?? "", node.marks)}</>;
  const children = node.content?.map((child, index) => (
    <BlogNode
      assets={assets}
      key={`${path}-${index}`}
      node={child}
      path={`${path}-${index}`}
    />
  ));
  const alignment = node.attrs?.textAlign as
    CSSProperties["textAlign"] | undefined;
  if (node.type === "doc") return <>{children}</>;
  if (node.type === "paragraph")
    return (
      <p
        className="mt-5 min-h-6 text-base leading-8 text-foreground/82"
        style={{ textAlign: alignment }}
      >
        {children}
      </p>
    );
  if (node.type === "heading") {
    const level = Number(node.attrs?.level ?? 2);
    if (level === 4)
      return (
        <h4
          className="mt-8 font-serif text-2xl"
          style={{ textAlign: alignment }}
        >
          {children}
        </h4>
      );
    if (level === 3)
      return (
        <h3
          className="mt-10 font-serif text-3xl"
          style={{ textAlign: alignment }}
        >
          {children}
        </h3>
      );
    return (
      <h2
        className="mt-12 font-serif text-4xl"
        style={{ textAlign: alignment }}
      >
        {children}
      </h2>
    );
  }
  if (node.type === "blockquote")
    return (
      <blockquote className="my-8 border-l-2 border-primary pl-6 text-lg italic text-muted-foreground">
        {children}
      </blockquote>
    );
  if (node.type === "bulletList")
    return <ul className="mt-6 list-disc space-y-2 pl-6">{children}</ul>;
  if (node.type === "orderedList")
    return <ol className="mt-6 list-decimal space-y-2 pl-6">{children}</ol>;
  if (node.type === "listItem")
    return <li className="leading-7">{children}</li>;
  if (node.type === "horizontalRule")
    return <hr className="my-10 border-border" />;
  if (node.type === "managedImage") {
    const asset =
      typeof node.attrs?.assetId === "string"
        ? assets.get(node.attrs.assetId)
        : undefined;
    const src =
      asset?.url ??
      (typeof node.attrs?.src === "string" ? node.attrs.src : null);
    if (!src) return null;
    return (
      <figure className="my-10 overflow-hidden rounded-2xl border border-border bg-card">
        <Image
          alt={String(node.attrs?.alt ?? asset?.altText ?? "Blog image")}
          className="h-auto w-full object-cover"
          height={asset?.height ?? 900}
          sizes="(min-width: 768px) 768px, 100vw"
          src={src}
          width={asset?.width ?? 1400}
        />
        {(node.attrs?.caption || asset?.caption) && (
          <figcaption className="px-5 py-3 text-sm text-muted-foreground">
            {String(node.attrs?.caption ?? asset?.caption)}
          </figcaption>
        )}
      </figure>
    );
  }
  return null;
}

export function BlogContentRenderer({
  content,
  assets = [],
}: {
  content: BlogContent | unknown;
  assets?: BlogEditorAsset[];
}) {
  const rich = toBlogRichContent(content);
  return (
    <div className="blog-content">
      <BlogNode
        assets={new Map(assets.map((asset) => [asset.id, asset]))}
        node={rich.doc}
        path="root"
      />
    </div>
  );
}
