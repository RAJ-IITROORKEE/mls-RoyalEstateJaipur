"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  fontFamilyOptions,
  fontFamilyThemeClasses,
  parseFontFamily,
} from "@/features/site-appearance/font-family";

type SettingControlProps = {
  settingKey: string;
  initialValue: string;
  description: string | null;
};

export function SettingControl({
  settingKey,
  initialValue,
  description,
}: SettingControlProps) {
  const [value, setValue] = useState(initialValue);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [isRefreshing, startTransition] = useTransition();
  const controlId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previewButtonId = useId();
  const router = useRouter();
  const isFontFamily = settingKey === "appearance.fontFamily";
  const selectedFontFamily = parseFontFamily(value);
  const selectedOption = fontFamilyOptions.find(
    (option) => option.value === selectedFontFamily,
  );
  const status =
    state === "saving" || isRefreshing
      ? "Saving..."
      : state === "saved"
        ? "Saved"
        : state === "error"
          ? "Could not save. Try again."
          : "";

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
        requestAnimationFrame(() => {
          document.getElementById(previewButtonId)?.focus();
        });
        return;
      }
      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen, previewButtonId]);

  function closePreview() {
    setIsPreviewOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(previewButtonId)?.focus();
    });
  }

  async function save() {
    setState("saving");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: settingKey, value }),
      });
      if (!response.ok) {
        setState("error");
        return;
      }
      setState("saved");
      if (isFontFamily) startTransition(() => router.refresh());
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <form
        className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label
          className="grid gap-2 text-sm font-semibold"
          htmlFor={controlId}
        >
          {isFontFamily ? "Site font family" : settingKey}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id={controlId}
            onChange={(event) => {
              setValue(event.target.value);
              setState("idle");
            }}
            value={value}
          >
            {fontFamilyOptions.map((option) => (
              <option
                className="bg-background text-foreground checked:bg-primary checked:text-primary-foreground"
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              {selectedOption?.label}
            </p>
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              Selected
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {selectedOption?.description}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            id={previewButtonId}
            onClick={() => setIsPreviewOpen(true)}
            type="button"
            variant="outline"
          >
            Preview font
          </Button>
          <Button disabled={state === "saving" || isRefreshing} type="submit">
            Save and apply
          </Button>
          <span aria-live="polite" className="text-sm text-muted-foreground">
            {status}
          </span>
        </div>
      </form>
      {isPreviewOpen ? (
        <div
          aria-label="Font preview"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closePreview();
          }}
          role="dialog"
        >
          <article
            className={`${fontFamilyThemeClasses[selectedFontFamily]} font-sans max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl sm:p-10`}
            ref={dialogRef}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Font preview
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedOption?.label}
                </p>
              </div>
              <button
                aria-label="Close preview"
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={closePreview}
                ref={closeButtonRef}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="mt-10 border-y border-border py-8 sm:py-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Property journal · Jaipur
              </p>
              <h2 className="mt-4 font-serif text-5xl leading-[0.95] sm:text-7xl">
                A home shaped by light
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                How a quieter plan, careful proportions, and a courtyard can
                make a home feel more considered from the first visit.
              </p>
            </div>
            <div className="mt-8 max-w-2xl space-y-5 text-base leading-8">
              <p>
                Good property decisions begin with what the space makes easy:
                where daylight lands, how rooms connect, and whether daily life
                has room to unfold without friction.
              </p>
              <p>
                This preview shows display headings, body copy, labels, and
                comfortable reading rhythm in the selected font pair.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-sm font-semibold">
                <span className="rounded-full bg-muted px-3 py-2">3 bedrooms</span>
                <span className="rounded-full bg-muted px-3 py-2">2,400 sq ft</span>
                <span className="rounded-full bg-muted px-3 py-2">Vaishali Nagar</span>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
