"use client";

import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Extension, mergeAttributes, Node } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useState } from "react";

import type { BlogEditorAsset } from "@/features/blog/editor";
import {
  blogFontSizes,
  blogHighlightColors,
  blogTextColors,
  type BlogRichNode,
} from "@/features/blog/schemas";

const ManagedImage = Node.create({
  name: "managedImage",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      assetId: { default: null },
      src: { default: null },
      alt: { default: "" },
      caption: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "figure[data-managed-blog-image]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes({ "data-managed-blog-image": "true" }),
      [
        "img",
        {
          src: HTMLAttributes.src,
          alt: HTMLAttributes.alt,
          draggable: "false",
        },
      ],
      ["figcaption", {}, HTMLAttributes.caption || ""],
    ];
  },
});

const FontSize = Extension.create({
  name: "blogFontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) =>
              attributes.fontSize
                ? { style: `font-size: ${attributes.fontSize}` }
                : {},
          },
        },
      },
    ];
  },
});

type RichBlogEditorProps = {
  initialDocument: BlogRichNode;
  editable: boolean;
  onChange: (doc: BlogRichNode) => void;
  onUpload: (
    file: File,
    altText: string,
    caption: string,
  ) => Promise<BlogEditorAsset | null>;
};

function ToolbarButton({
  active = false,
  disabled = false,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={`grid size-9 shrink-0 place-items-center rounded-lg border text-sm transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted"
      } disabled:cursor-not-allowed disabled:opacity-40`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export function RichBlogEditor({
  initialDocument,
  editable,
  onChange,
  onUpload,
}: RichBlogEditorProps) {
  const [, setRevision] = useState(0);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    content: initialDocument,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: false,
        protocols: ["http", "https", "mailto", "tel"],
      }),
      TextStyle,
      FontSize,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      ManagedImage,
    ],
    onSelectionUpdate: () => setRevision((value) => value + 1),
    onUpdate: ({ editor: current }) => {
      onChange(current.getJSON() as BlogRichNode);
      setRevision((value) => value + 1);
    },
  });

  if (!editor) return <div className="min-h-80 animate-pulse bg-muted/40" />;
  const disabled = !editable;
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt(
      "Enter a safe web, email, phone, or site-relative link",
      previous ?? "https://",
    );
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().unsetLink().run();
    else
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: href.trim() })
        .run();
  };
  const uploadInlineImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || imageAlt.trim().length < 3) {
      setImageError("Add descriptive alt text before choosing an image.");
      return;
    }
    setUploading(true);
    setImageError("");
    const asset = await onUpload(file, imageAlt.trim(), imageCaption.trim());
    setUploading(false);
    if (!asset?.url) {
      setImageError("The managed image could not be inserted.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "managedImage",
        attrs: {
          assetId: asset.id,
          src: asset.url,
          alt: asset.altText,
          caption: asset.caption ?? "",
        },
      })
      .run();
    setImageAlt("");
    setImageCaption("");
    setShowImageUpload(false);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex gap-1.5 overflow-x-auto p-3">
          <select
            aria-label="Text style"
            className="h-9 shrink-0 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
            disabled={disabled}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "paragraph")
                editor.chain().focus().setParagraph().run();
              else
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: Number(value) as 2 | 3 | 4 })
                  .run();
            }}
            value={
              editor.isActive("heading", { level: 2 })
                ? "2"
                : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : editor.isActive("heading", { level: 4 })
                    ? "4"
                    : "paragraph"
            }
          >
            <option value="paragraph">Paragraph</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
          </select>
          <ToolbarButton
            active={editor.isActive("bold")}
            disabled={disabled}
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            disabled={disabled}
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            disabled={disabled}
            label="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            disabled={disabled}
            label="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <select
            aria-label="Font size"
            className="h-9 shrink-0 rounded-lg border border-border bg-background px-2 text-xs"
            disabled={disabled}
            onChange={(event) =>
              editor
                .chain()
                .focus()
                .setMark("textStyle", { fontSize: event.target.value || null })
                .run()
            }
            value={
              (editor.getAttributes("textStyle").fontSize as
                string | undefined) ?? ""
            }
          >
            <option value="">Text size</option>
            {blogFontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <select
            aria-label="Text color"
            className="h-9 shrink-0 rounded-lg border border-border bg-background px-2 text-xs"
            disabled={disabled}
            onChange={(event) =>
              editor.chain().focus().setColor(event.target.value).run()
            }
            value={
              (editor.getAttributes("textStyle").color as string | undefined) ??
              ""
            }
          >
            <option value="">Text color</option>
            {blogTextColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          <select
            aria-label="Highlight color"
            className="h-9 shrink-0 rounded-lg border border-border bg-background px-2 text-xs"
            disabled={disabled}
            onChange={(event) =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: event.target.value })
                .run()
            }
            value=""
          >
            <option value="">Highlight</option>
            {blogHighlightColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          <ToolbarButton
            active={editor.isActive({ textAlign: "left" })}
            disabled={disabled}
            label="Align left"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "center" })}
            disabled={disabled}
            label="Align center"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "right" })}
            disabled={disabled}
            label="Align right"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("bulletList")}
            disabled={disabled}
            label="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            disabled={disabled}
            label="Ordered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("blockquote")}
            disabled={disabled}
            label="Quote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("link")}
            disabled={disabled}
            label="Add or edit link"
            onClick={setLink}
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled}
            label="Insert managed image"
            onClick={() => setShowImageUpload((value) => !value)}
          >
            <ImagePlus className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled}
            label="Clear formatting"
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
          >
            <RemoveFormatting className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled || !editor.can().undo()}
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled || !editor.can().redo()}
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
        {showImageUpload && editable && (
          <div className="grid gap-3 border-t border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-1 text-xs font-semibold">
              Image description (required)
              <input
                className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm font-normal"
                onChange={(event) => setImageAlt(event.target.value)}
                placeholder="Describe what the image shows"
                value={imageAlt}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              Caption
              <input
                className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm font-normal"
                onChange={(event) => setImageCaption(event.target.value)}
                placeholder="Optional visible caption"
                value={imageCaption}
              />
            </label>
            <label className="inline-flex min-h-10 cursor-pointer items-center justify-center self-end rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground">
              {uploading ? "Uploading..." : "Choose image"}
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading || imageAlt.trim().length < 3}
                onChange={(event) => void uploadInlineImage(event)}
                type="file"
              />
            </label>
            {imageError && (
              <p
                aria-live="polite"
                className="text-xs text-destructive sm:col-span-2 lg:col-span-3"
              >
                {imageError}
              </p>
            )}
          </div>
        )}
      </div>
      <EditorContent
        aria-label="Blog content editor"
        className="blog-rich-editor min-h-[32rem]"
        editor={editor}
      />
    </section>
  );
}
