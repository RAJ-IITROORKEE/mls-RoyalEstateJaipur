"use client";

import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  type SubmissionDraft,
  areaUnits,
  submissionCategories,
  submissionIntents,
} from "@/features/submissions/schemas";
import { Button } from "@/components/ui/button";
import { OwnerSubmissionMedia } from "@/components/forms/owner-submission-media";

export const defaultDraft: SubmissionDraft = {
  intent: "SELL",
  category: "RESIDENTIAL",
  otherPropertyType: "",
  title: "",
  description: "",
  localityName: "",
  city: "Jaipur",
  state: "Rajasthan",
  postalCode: "",
  addressLine: "",
  priceMinor: "",
  priceOnRequest: false,
  isNegotiable: false,
  areaValue: "",
  areaUnit: "SQ_FT",
  bedrooms: null,
  bathrooms: null,
  floors: null,
  furnishing: "",
  possession: "",
  amenities: [],
  highlights: [],
  ownerPhone: "",
  consent: false,
};

const steps = [
  "Purpose",
  "Location",
  "Details",
  "Photos",
  "Price",
  "Review",
] as const;

function text(value: string | undefined | null) {
  return value ?? "";
}

export function OwnerSubmissionWizard({
  initialSubmissionId,
  initialDraft,
}: {
  initialSubmissionId?: string;
  initialDraft?: SubmissionDraft;
}) {
  const [draft, setDraft] = useState<SubmissionDraft>({
    ...defaultDraft,
    ...initialDraft,
  });
  const [submissionId, setSubmissionId] = useState(initialSubmissionId ?? "");
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("Draft not saved yet.");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mediaCount, setMediaCount] = useState<number | null>(null);
  const requestNumber = useRef(0);

  const saveDraft = useCallback(
    async (
      action: "SAVE_DRAFT" | "SUBMIT" = "SAVE_DRAFT",
    ): Promise<string | null> => {
      const currentRequest = requestNumber.current + 1;
      requestNumber.current = currentRequest;
      setSaving(true);
      setError("");
      setStatus(action === "SUBMIT" ? "Submitting..." : "Saving...");
      const formData = new FormData();
      formData.set("action", action);
      if (submissionId) formData.set("submissionId", submissionId);
      formData.set("payload", JSON.stringify(draft));
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          body: formData,
        });
        const result: unknown = await response.json();
        if (
          !response.ok ||
          typeof result !== "object" ||
          result === null ||
          !("submission" in result)
        ) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "The submission could not be saved.";
          throw new Error(message);
        }
        if (currentRequest !== requestNumber.current) return null;
        const submission = result.submission as { id: string; status: string };
        setSubmissionId(submission.id);
        setStatus(
          action === "SUBMIT" ? "Submitted for review." : "Saved just now.",
        );
        if (action === "SUBMIT")
          window.location.assign(`/account/submissions/${submission.id}`);
        return submission.id;
      } catch (caught) {
        if (currentRequest === requestNumber.current) {
          setError(
            caught instanceof Error
              ? caught.message
              : "The submission could not be saved.",
          );
          setStatus("Save failed.");
        }
        return null;
      } finally {
        if (currentRequest === requestNumber.current) setSaving(false);
      }
    },
    [draft, submissionId],
  );

  useEffect(() => {
    if (!submissionId || step === steps.length - 1) return;
    const timeout = window.setTimeout(() => void saveDraft(), 900);
    return () => window.clearTimeout(timeout);
  }, [draft, saveDraft, step, submissionId]);

  function update<Key extends keyof SubmissionDraft>(
    key: Key,
    value: SubmissionDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function next() {
    setError("");
    if (
      step === 0 &&
      draft.category === "OTHER" &&
      !draft.otherPropertyType?.trim()
    )
      return setError("Specify the property type before continuing.");
    if (step === 1 && (!draft.localityName || !draft.city || !draft.state))
      return setError("Add the locality, city, and state before continuing.");
    if (step === 2) {
      if (!draft.title || !draft.description || !draft.areaValue)
        return setError(
          "Add a title, description, and area before continuing.",
        );
      const savedSubmissionId = await saveDraft();
      if (!savedSubmissionId) return;
    }
    if (step === 3 && (mediaCount ?? 0) < 1)
      return setError("Upload at least 1 preview image before continuing.");
    if (step < steps.length - 1) setStep((current) => current + 1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
      <aside className="h-fit rounded-2xl bg-primary p-6 text-primary-foreground lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          Owner workspace
        </p>
        <h1 className="mt-4 font-serif text-4xl">
          Present the property clearly.
        </h1>
        <ol className="mt-10 grid gap-3">
          {steps.map((label, index) => (
            <li
              className={`flex items-center gap-3 text-sm ${index === step ? "font-bold text-accent" : "text-primary-foreground/60"}`}
              key={label}
            >
              <span className="grid size-7 place-items-center rounded-full border border-current text-xs">
                {index < step ? (
                  <Check aria-hidden="true" className="size-3" />
                ) : (
                  index + 1
                )}
              </span>
              {label}
            </li>
          ))}
        </ol>
        <p className="mt-10 text-xs leading-5 text-primary-foreground/60">
          Your draft stays private until you submit it for review.
        </p>
      </aside>
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="mt-2 font-serif text-4xl">{steps[step]}</h2>
          </div>
          <span
            aria-live="polite"
            className="text-right text-xs text-muted-foreground"
          >
            {status}
          </span>
        </div>
        {error && (
          <p
            aria-live="assertive"
            className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm leading-6 text-destructive"
          >
            {error}
          </p>
        )}
        <div className="mt-8 grid gap-5">
          {step === 0 && (
            <>
              <fieldset>
                <legend className="text-sm font-bold">
                  What are you presenting?
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {submissionIntents.map((intent) => (
                    <label className="cursor-pointer" key={intent}>
                      <input
                        checked={draft.intent === intent}
                        className="peer sr-only"
                        name="intent"
                        onChange={() => update("intent", intent)}
                        type="radio"
                      />
                      <span className="block rounded-xl border border-border p-4 text-sm font-semibold peer-checked:border-primary peer-checked:bg-primary/5">
                        {intent === "SELL"
                          ? "For sale"
                          : intent === "RENT"
                            ? "For rent"
                            : "For lease"}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-2 text-sm font-semibold">
                Property type
                <select
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) => {
                    const category = event.target
                      .value as SubmissionDraft["category"];
                    update("category", category);
                    if (category === "PLOT") {
                      update("bedrooms", null);
                      update("bathrooms", null);
                    }
                  }}
                  value={draft.category}
                >
                  {submissionCategories.map((category) => (
                    <option key={category} value={category}>
                      {category[0] + category.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              {draft.category === "OTHER" && (
                <label className="grid gap-2 text-sm font-semibold">
                  Please specify the property type
                  <input
                    className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onChange={(event) =>
                      update("otherPropertyType", event.target.value)
                    }
                    placeholder="For example, heritage haveli"
                    value={text(draft.otherPropertyType)}
                  />
                </label>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <label className="grid gap-2 text-sm font-semibold">
                Locality
                <input
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) =>
                    update("localityName", event.target.value)
                  }
                  value={draft.localityName}
                />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  City
                  <input
                    className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onChange={(event) => update("city", event.target.value)}
                    value={draft.city}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  State
                  <input
                    className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onChange={(event) => update("state", event.target.value)}
                    value={draft.state}
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-semibold">
                Address{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
                <input
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) =>
                    update("addressLine", event.target.value)
                  }
                  value={text(draft.addressLine)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Postal code{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
                <input
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  inputMode="numeric"
                  onChange={(event) => update("postalCode", event.target.value)}
                  value={text(draft.postalCode)}
                />
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <label className="grid gap-2 text-sm font-semibold">
                Listing title
                <input
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) => update("title", event.target.value)}
                  value={draft.title}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Description
                <textarea
                  className="min-h-40 rounded-xl border border-border bg-background p-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  value={draft.description}
                />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  Area
                  <input
                    className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    inputMode="decimal"
                    onChange={(event) =>
                      update("areaValue", event.target.value)
                    }
                    value={text(draft.areaValue)}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Unit
                  <select
                    className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onChange={(event) =>
                      update(
                        "areaUnit",
                        event.target.value as SubmissionDraft["areaUnit"],
                      )
                    }
                    value={draft.areaUnit}
                  >
                    {areaUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {draft.category !== "PLOT" && (
                <div className="grid gap-5 sm:grid-cols-3">
                  <label className="grid gap-2 text-sm font-semibold">
                    Bedrooms
                    <input
                      className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      inputMode="numeric"
                      onChange={(event) =>
                        update(
                          "bedrooms",
                          event.target.value
                            ? Number(event.target.value)
                            : null,
                        )
                      }
                      type="number"
                      value={draft.bedrooms ?? ""}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Bathrooms
                    <input
                      className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      inputMode="numeric"
                      onChange={(event) =>
                        update(
                          "bathrooms",
                          event.target.value
                            ? Number(event.target.value)
                            : null,
                        )
                      }
                      type="number"
                      value={draft.bathrooms ?? ""}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Floors
                    <input
                      className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      inputMode="numeric"
                      onChange={(event) =>
                        update(
                          "floors",
                          event.target.value
                            ? Number(event.target.value)
                            : null,
                        )
                      }
                      type="number"
                      value={draft.floors ?? ""}
                    />
                  </label>
                </div>
              )}
              <label className="grid gap-2 text-sm font-semibold">
                Amenities{" "}
                <span className="font-normal text-muted-foreground">
                  (comma separated)
                </span>
                <input
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) =>
                    update(
                      "amenities",
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                  value={draft.amenities.join(", ")}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Highlights{" "}
                <span className="font-normal text-muted-foreground">
                  (one per line)
                </span>
                <textarea
                  className="min-h-28 rounded-xl border border-border bg-background p-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) =>
                    update(
                      "highlights",
                      event.target.value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                  value={draft.highlights.join("\n")}
                />
              </label>
            </>
          )}
          {step === 3 && submissionId && (
            <OwnerSubmissionMedia
              onCountChange={setMediaCount}
              submissionId={submissionId}
            />
          )}
          {step === 4 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  Price in rupees{" "}
                  <span className="font-normal text-muted-foreground">
                    (e.g. ₹3,00,000)
                  </span>
                  <input
                    className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    inputMode="numeric"
                    onChange={(event) => {
                      const rupees = event.target.value.replace(/\D/g, "");
                      update(
                        "priceMinor",
                        rupees ? `${BigInt(rupees) * BigInt(100)}` : "",
                      );
                    }}
                    value={
                      draft.priceMinor
                        ? new Intl.NumberFormat("en-IN").format(
                            Number(BigInt(draft.priceMinor) / BigInt(100)),
                          )
                        : ""
                    }
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Possession or availability
                  <input
                    className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onChange={(event) =>
                      update("possession", event.target.value)
                    }
                    value={text(draft.possession)}
                  />
                </label>
              </div>
              <label className="flex items-start gap-3 text-sm leading-6">
                <input
                  checked={draft.priceOnRequest}
                  className="mt-1 size-4 accent-primary"
                  onChange={(event) =>
                    update("priceOnRequest", event.target.checked)
                  }
                  type="checkbox"
                />
                <span>Price on request</span>
              </label>
              <label className="flex items-start gap-3 text-sm leading-6">
                <input
                  checked={draft.isNegotiable}
                  className="mt-1 size-4 accent-primary"
                  onChange={(event) =>
                    update("isNegotiable", event.target.checked)
                  }
                  type="checkbox"
                />
                <span>Price is negotiable</span>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Owner phone{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
                <input
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="tel"
                  inputMode="tel"
                  onChange={(event) => update("ownerPhone", event.target.value)}
                  value={text(draft.ownerPhone)}
                />
              </label>
            </>
          )}
          {step === 5 && (
            <>
              <div className="rounded-xl border border-border bg-muted/40 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {draft.intent === "SELL"
                    ? "For sale"
                    : draft.intent.toLowerCase()}{" "}
                  · {draft.category.toLowerCase()}
                </p>
                <h3 className="mt-3 font-serif text-3xl">
                  {draft.title || "Untitled submission"}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {draft.localityName || "Locality pending"},{" "}
                  {draft.city || "City pending"},{" "}
                  {draft.state || "State pending"}
                </p>
                <p className="mt-5 whitespace-pre-line text-sm leading-6">
                  {draft.description || "Description pending"}
                </p>
              </div>
              <label className="flex items-start gap-3 text-sm leading-6">
                <input
                  checked={draft.consent}
                  className="mt-1 size-4 accent-primary"
                  onChange={(event) => update("consent", event.target.checked)}
                  type="checkbox"
                />
                <span>
                  I confirm that I am authorized to submit these details and
                  consent to being contacted about this listing.
                </span>
              </label>
            </>
          )}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
            href="/account/submissions"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Exit
          </Link>
          <div className="flex flex-wrap gap-2">
            {step > 0 && (
              <Button
                onClick={() => setStep((current) => current - 1)}
                type="button"
                variant="ghost"
              >
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                disabled={saving}
                onClick={() => void next()}
                type="button"
              >
                Next <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : (
              <Button
                disabled={saving || !draft.consent}
                onClick={() => void saveDraft("SUBMIT")}
                type="button"
              >
                Submit for review
              </Button>
            )}
            <Button
              disabled={saving}
              onClick={() => void saveDraft()}
              type="button"
              variant="outline"
            >
              <Save aria-hidden="true" className="size-4" /> Save draft
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
