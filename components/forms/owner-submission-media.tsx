"use client";

import Image from "next/image";
import { ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PreviewMedia = {
  id: string;
  fileName: string;
  altText: string;
  width: number;
  height: number;
  sortOrder: number;
  isCover: boolean;
  url: string | null;
  localUrl?: string;
};

export function OwnerSubmissionMedia({
  onCountChange,
  submissionId,
}: {
  onCountChange?: (count: number) => void;
  submissionId: string;
}) {
  const [media, setMedia] = useState<PreviewMedia[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onCountChange?.(media.length);
  }, [media.length, onCountChange]);

  useEffect(() => {
    let active = true;
    void fetch(`/api/submissions/${submissionId}/media`)
      .then((response) => response.json())
      .then((result: { media?: PreviewMedia[] }) => {
        if (active) {
          const nextMedia = result.media ?? [];
          setMedia(nextMedia);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [onCountChange, submissionId]);

  async function upload(file: File) {
    if (!file.type.match(/^image\/(jpeg|png)$/))
      return setMessage("Use a JPG or PNG image.");
    if (file.size > 10 * 1024 * 1024)
      return setMessage("Each image must be 10 MB or smaller.");
    if (media.length >= 5)
      return setMessage("You can add up to 5 preview images.");
    setBusy(true);
    setMessage("");
    const localUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = async () => {
      const formData = new FormData();
      formData.set("file", file);
      formData.set(
        "altText",
        file.name.replace(/\.[^.]+$/, "").slice(0, 180) || "Property preview",
      );
      formData.set("width", String(image.naturalWidth));
      formData.set("height", String(image.naturalHeight));
      try {
        const response = await fetch(`/api/submissions/${submissionId}/media`, {
          method: "POST",
          body: formData,
        });
        const result = (await response.json()) as {
          media?: Omit<PreviewMedia, "url">;
          error?: string;
        };
        if (!response.ok || !result.media)
          throw new Error(result.error ?? "The image could not be uploaded.");
        setMedia((current) => {
          return [...current, { ...result.media!, url: null, localUrl }];
        });
        setMessage("Image uploaded. Add another preview or continue.");
      } catch (error) {
        URL.revokeObjectURL(localUrl);
        setMessage(
          error instanceof Error
            ? error.message
            : "The image could not be uploaded.",
        );
      } finally {
        setBusy(false);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(localUrl);
      setBusy(false);
      setMessage("The image could not be read.");
    };
    image.src = localUrl;
  }

  async function updateMedia(
    item: PreviewMedia,
    update: Partial<Pick<PreviewMedia, "altText" | "sortOrder" | "isCover">>,
  ) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/media?mediaId=${encodeURIComponent(item.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        },
      );
      const result = (await response.json()) as {
        media?: PreviewMedia;
        error?: string;
      };
      if (!response.ok || !result.media)
        throw new Error(result.error ?? "Image could not be updated.");
      setMedia((current) =>
        current.map((entry) =>
          update.isCover
            ? { ...entry, isCover: entry.id === item.id }
            : entry.id === item.id
              ? { ...entry, ...result.media }
              : entry,
        ),
      );
      setMessage("Image details saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Image could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeMedia(item: PreviewMedia) {
    if (!window.confirm(`Remove ${item.fileName}?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/media?mediaId=${encodeURIComponent(item.id)}`,
        { method: "DELETE" },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Image could not be removed.");
      setMedia((current) => current.filter((entry) => entry.id !== item.id));
      setMessage("Image removed.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Image could not be removed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-muted/20 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Preview images
          </p>
          <h2 className="mt-2 font-serif text-3xl">
            Show the property clearly.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Upload between 1 and 5 JPG or PNG images. Choose the strongest
            photograph as the cover banner shown on the public property page.
            Images remain private until this submission is approved and
            published.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
          disabled={busy || media.length >= 5}
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          <ImagePlus className="size-4" /> Upload more
        </button>
      </div>
      <input
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        className="sr-only"
        multiple
        onChange={(event) => {
          const availableSlots = Math.max(0, 5 - media.length);
          const files = Array.from(event.target.files ?? []).slice(
            0,
            availableSlots,
          );
          if (files.length > 0)
            void files.reduce(
              (promise, file) => promise.then(() => upload(file)),
              Promise.resolve(),
            );
          event.target.value = "";
        }}
        ref={fileRef}
        type="file"
      />
      {message && (
        <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
          {busy && <LoaderCircle className="mr-2 inline size-4 animate-spin" />}{" "}
          {message}
        </p>
      )}
      <div
        className="mt-5 flex items-center gap-3"
        aria-label={`${media.length} of 5 images uploaded`}
      >
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${(media.length / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          {media.length}/5 uploaded · minimum 1
        </span>
      </div>
      {media.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <figure
              className="overflow-hidden rounded-xl border border-border bg-card"
              key={item.id}
            >
              <div className="relative aspect-[4/3] bg-muted">
                {(item.localUrl || item.url) && (
                  <Image
                    alt={item.altText}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={item.localUrl || item.url || ""}
                    unoptimized
                  />
                )}
              </div>
              <figcaption className="grid gap-3 p-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-semibold">
                    {item.fileName}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {item.width} × {item.height}
                  </span>
                </div>
                <label className="grid gap-1 font-semibold">
                  Image description
                  <input
                    className="min-h-9 rounded-lg border border-border bg-background px-2 font-normal"
                    defaultValue={item.altText}
                    onBlur={(event) => {
                      if (event.target.value !== item.altText)
                        void updateMedia(item, { altText: event.target.value });
                    }}
                  />
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-border px-3 font-semibold hover:bg-muted"
                    disabled={busy}
                    onClick={() => void updateMedia(item, { isCover: true })}
                    type="button"
                  >
                    <Star
                      className={`size-3 ${item.isCover ? "fill-current text-accent" : ""}`}
                    />
                    {item.isCover ? "Cover image" : "Make cover"}
                  </button>
                  <button
                    aria-label={`Remove ${item.fileName}`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-3 font-semibold text-destructive hover:bg-destructive/10"
                    disabled={busy}
                    onClick={() => void removeMedia(item)}
                    type="button"
                  >
                    <Trash2 className="size-4" />
                    Remove image
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <button
          className="mt-6 flex min-h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground"
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          <ImagePlus className="mb-2 size-6 text-primary" />
          Add the first preview image
        </button>
      )}
    </section>
  );
}
