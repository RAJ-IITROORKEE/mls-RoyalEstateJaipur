"use client";

import { Eye, ImagePlus, Save, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { RichBlogEditor } from "@/components/admin/rich-blog-editor";
import { BlogContentRenderer } from "@/components/blog/blog-content";
import {
  emptyBlogRichContent,
  hydrateBlogImageUrls,
  serializeBlogDocument,
  toBlogRichContent,
  type BlogEditorAsset,
} from "@/features/blog/editor";
import type { BlogRichNode } from "@/features/blog/schemas";

type BlogEditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  readingMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  coverAssetId: string | null;
  assets: BlogEditorAsset[];
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function BlogEditor({ post }: { post?: BlogEditorPost }) {
  const initialRich = toBlogRichContent(post?.content ?? emptyBlogRichContent);
  const initialAssets = post?.assets ?? [];
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [readingMinutes, setReadingMinutes] = useState(
    String(post?.readingMinutes ?? 4),
  );
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seoDescription ?? "",
  );
  const [document, setDocument] = useState<BlogRichNode>(() =>
    hydrateBlogImageUrls(initialRich.doc, initialAssets),
  );
  const [assets, setAssets] = useState(initialAssets);
  const [coverAssetId, setCoverAssetId] = useState(post?.coverAssetId ?? null);
  const [coverAlt, setCoverAlt] = useState("");
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const editable = !post || post.status === "DRAFT";
  const coverAsset = assets.find((asset) => asset.id === coverAssetId);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(createSlug(value));
    setDirty(true);
  }

  async function save() {
    setBusy(true);
    setStatus("Saving draft...");
    const payload = {
      title,
      slug,
      excerpt,
      content: serializeBlogDocument(document),
      readingMinutes,
      seoTitle,
      seoDescription,
    };
    const response = await fetch(
      post ? `/api/admin/blog/${post.id}` : "/api/admin/blog",
      {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: post ? "PATCH" : "POST",
      },
    );
    const result = (await response.json()) as {
      error?: string;
      post?: { id: string };
    };
    setBusy(false);
    if (!response.ok) {
      setStatus(result.error ?? "Blog post could not be saved.");
      return;
    }
    setDirty(false);
    setStatus("Draft saved.");
    if (!post && result.post?.id)
      window.location.assign(`/admin/blog/${result.post.id}`);
  }

  async function changeStatus(nextStatus: "PUBLISHED" | "ARCHIVED" | "DRAFT") {
    if (!post) return setStatus("Save the draft before changing status.");
    if (dirty)
      return setStatus(
        "Save your draft changes before changing publication status.",
      );
    setBusy(true);
    setStatus(`${nextStatus === "PUBLISHED" ? "Publishing" : "Updating"}...`);
    const response = await fetch(`/api/admin/blog/${post.id}`, {
      body: JSON.stringify({ status: nextStatus }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    const result = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok)
      return setStatus(result.error ?? "Status could not be updated.");
    setStatus(`Post marked ${nextStatus.toLowerCase()}.`);
    window.location.reload();
  }

  async function uploadAsset(
    file: File,
    altText: string,
    caption: string,
    purpose: "inline" | "cover" = "inline",
  ) {
    if (!post) {
      setStatus("Save the draft before uploading managed images.");
      return null;
    }
    setBusy(true);
    setStatus(
      purpose === "cover"
        ? "Uploading cover image..."
        : "Uploading managed image...",
    );
    const form = new FormData();
    form.set("file", file);
    form.set("postId", post.id);
    form.set("altText", altText);
    form.set("caption", caption);
    form.set("purpose", purpose);
    const response = await fetch("/api/admin/blog/assets", {
      method: "POST",
      body: form,
    });
    const result = (await response.json()) as {
      error?: string;
      asset?: BlogEditorAsset;
    };
    setBusy(false);
    if (!response.ok || !result.asset) {
      setStatus(result.error ?? "Image upload failed.");
      return null;
    }
    setAssets((current) => [...current, result.asset!]);
    if (purpose === "cover") setCoverAssetId(result.asset.id);
    setStatus(
      purpose === "cover" ? "Cover image updated." : "Managed image inserted.",
    );
    return result.asset;
  }

  return (
    <div className="space-y-6">
      {!editable && (
        <div className="rounded-2xl border border-accent/50 bg-accent/10 p-4 text-sm leading-6">
          This post is {post?.status.toLowerCase()}. Move it to draft before
          editing content or media.
        </div>
      )}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
            Title
            <input
              className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal"
              disabled={!editable}
              onChange={(event) => updateTitle(event.target.value)}
              value={title}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Slug
            <input
              className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal"
              disabled={!editable}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(createSlug(event.target.value));
                setDirty(true);
              }}
              value={slug}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Reading minutes
            <input
              className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal"
              disabled={!editable}
              inputMode="numeric"
              min="1"
              onChange={(event) => {
                setReadingMinutes(event.target.value);
                setDirty(true);
              }}
              type="number"
              value={readingMinutes}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
            Excerpt
            <textarea
              className="min-h-24 rounded-xl border border-border bg-background p-3 font-normal"
              disabled={!editable}
              maxLength={1000}
              onChange={(event) => {
                setExcerpt(event.target.value);
                setDirty(true);
              }}
              value={excerpt}
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Cover image
            </p>
            <h2 className="mt-2 font-serif text-3xl">
              Set the editorial frame.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Required for publication and used on blog cards and the article
              header. JPG, PNG, or WebP up to 10 MB.
            </p>
            {!post ? (
              <p className="mt-5 text-sm font-semibold">
                Save the draft once to upload its cover.
              </p>
            ) : editable ? (
              <div className="mt-5 grid gap-3">
                <label className="grid gap-1 text-xs font-semibold">
                  Cover image description
                  <input
                    className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm font-normal"
                    onChange={(event) => setCoverAlt(event.target.value)}
                    placeholder="Describe the image for screen readers"
                    value={coverAlt}
                  />
                </label>
                <label className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">
                  <ImagePlus className="size-4" />{" "}
                  {coverAsset ? "Replace cover" : "Upload cover"}
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={busy || coverAlt.trim().length < 3}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file)
                        void uploadAsset(file, coverAlt.trim(), "", "cover");
                    }}
                    type="file"
                  />
                </label>
              </div>
            ) : null}
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
            {coverAsset?.url ? (
              <Image
                alt={coverAsset.altText}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={coverAsset.url}
              />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">
                No cover image selected
              </div>
            )}
          </div>
        </div>
      </section>

      <RichBlogEditor
        editable={editable}
        initialDocument={document}
        onChange={(nextDocument) => {
          setDocument(nextDocument);
          setDirty(true);
        }}
        onUpload={(file, alt, caption) =>
          uploadAsset(file, alt, caption, "inline")
        }
      />
      {!post && (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          You can write now. Save the draft once before adding managed inline
          images or a cover.
        </p>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Search preview
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            SEO title
            <input
              className="min-h-11 rounded-xl border border-border bg-background px-3 font-normal"
              disabled={!editable}
              maxLength={200}
              onChange={(event) => {
                setSeoTitle(event.target.value);
                setDirty(true);
              }}
              value={seoTitle}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            SEO description
            <textarea
              className="min-h-11 rounded-xl border border-border bg-background p-3 font-normal"
              disabled={!editable}
              maxLength={320}
              onChange={(event) => {
                setSeoDescription(event.target.value);
                setDirty(true);
              }}
              value={seoDescription}
            />
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {status ||
            (dirty
              ? "Unsaved changes"
              : post
                ? `Status: ${post.status.toLowerCase()}`
                : "Draft not saved")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold"
            onClick={() => setPreview(true)}
            type="button"
          >
            <Eye className="size-4" /> Preview
          </button>
          {post?.status === "DRAFT" && (
            <button
              className="min-h-11 rounded-xl border border-primary px-4 text-sm font-bold text-primary disabled:opacity-50"
              disabled={busy || !coverAssetId}
              onClick={() => void changeStatus("PUBLISHED")}
              type="button"
            >
              Publish
            </button>
          )}
          {post?.status === "PUBLISHED" && (
            <button
              className="min-h-11 rounded-xl border border-border px-4 text-sm font-bold"
              disabled={busy}
              onClick={() => void changeStatus("DRAFT")}
              type="button"
            >
              Move to draft
            </button>
          )}
          {editable && (
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
              disabled={busy}
              onClick={() => void save()}
              type="button"
            >
              <Save className="size-4" /> Save draft
            </button>
          )}
        </div>
      </div>

      {preview && (
        <div
          aria-label="Blog preview"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
          role="dialog"
        >
          <article className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-background p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Unsaved preview
                </p>
                <h2 className="mt-3 font-serif text-5xl">
                  {title || "Untitled post"}
                </h2>
              </div>
              <button
                aria-label="Close preview"
                className="grid size-11 place-items-center rounded-xl border border-border"
                onClick={() => setPreview(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>
            {coverAsset?.url && (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
                <Image
                  alt={coverAsset.altText}
                  className="object-cover"
                  fill
                  sizes="896px"
                  src={coverAsset.url}
                />
              </div>
            )}
            <div className="mt-8">
              <BlogContentRenderer
                assets={assets}
                content={serializeBlogDocument(document)}
              />
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
