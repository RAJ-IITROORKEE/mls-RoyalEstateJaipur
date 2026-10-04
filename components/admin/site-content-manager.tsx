"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground";
const labelClass =
  "grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground";

async function submitJson(url: string, method: string, payload?: unknown) {
  const response = await fetch(url, {
    method,
    headers: payload ? { "content-type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error =
      result &&
      typeof result === "object" &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "The change could not be saved. Try again.";
    throw new Error(error);
  }
}

function faqPayload(form: FormData) {
  return {
    question: String(form.get("question") ?? ""),
    answer: String(form.get("answer") ?? ""),
    sortOrder: Number(form.get("sortOrder") ?? 0),
    isPublished: form.get("isPublished") === "on",
  };
}

export function SiteContentManager({ faqs }: { faqs: FaqItem[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    key: string,
    url: string,
    method: string,
    getPayload: (form: FormData) => unknown,
  ) {
    event.preventDefault();
    setPending(key);
    setMessage("");
    setError("");
    const formElement = event.currentTarget;
    try {
      await submitJson(url, method, getPayload(new FormData(formElement)));
      setMessage("Saved. Public pages will use the updated content.");
      if (method === "POST") formElement.reset();
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The change could not be saved.",
      );
    } finally {
      setPending(null);
    }
  }

  async function remove(url: string, noun: string) {
    if (
      !window.confirm(
        `Delete this ${noun}? This change will be recorded in the audit history.`,
      )
    )
      return;
    setPending(url);
    setMessage("");
    setError("");
    try {
      await submitJson(url, "DELETE");
      setMessage(
        noun === "locality"
          ? "Locality removed from public options."
          : "FAQ removed.",
      );
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The change could not be saved.",
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-10">
      <div aria-live="polite" className="space-y-2" role="status">
        {message && (
          <p className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <section aria-labelledby="faq-heading" className="space-y-5">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Public answers
          </p>
          <h2 className="mt-2 font-serif text-3xl" id="faq-heading">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Published answers appear on the home page. Keep claims specific to
            the service you provide.
          </p>
        </header>
        <form
          className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6"
          onSubmit={(event) =>
            handleSubmit(
              event,
              "faq-new",
              "/api/admin/faqs",
              "POST",
              faqPayload,
            )
          }
        >
          <h3 className="font-serif text-2xl sm:col-span-2">Add an answer</h3>
          <label className={`${labelClass} sm:col-span-2`}>
            Question
            <input
              className={fieldClass}
              maxLength={240}
              minLength={8}
              name="question"
              required
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Answer
            <textarea
              className={`${fieldClass} min-h-28 py-3`}
              maxLength={2000}
              minLength={12}
              name="answer"
              required
            />
          </label>
          <label className={labelClass}>
            Display order
            <input
              className={fieldClass}
              defaultValue={faqs.length}
              max={10000}
              min={0}
              name="sortOrder"
              required
              type="number"
            />
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
            <input
              className="size-4 accent-primary"
              defaultChecked
              name="isPublished"
              type="checkbox"
            />
            Publish on home page
          </label>
          <div className="sm:col-span-2">
            <Button disabled={pending !== null} type="submit">
              {pending === "faq-new" ? "Saving…" : "Add FAQ"}
            </Button>
          </div>
        </form>
        <div className="space-y-3">
          {faqs.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No FAQ entries have been created yet.
            </p>
          ) : (
            faqs.map((faq) => (
              <details
                className="rounded-2xl border border-border bg-card p-4 sm:p-5"
                key={faq.id}
              >
                <summary className="cursor-pointer font-semibold">
                  {faq.question}{" "}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {faq.isPublished ? "Published" : "Draft"}
                  </span>
                </summary>
                <form
                  className="mt-5 grid gap-4 sm:grid-cols-2"
                  onSubmit={(event) =>
                    handleSubmit(
                      event,
                      faq.id,
                      `/api/admin/faqs/${faq.id}`,
                      "PATCH",
                      faqPayload,
                    )
                  }
                >
                  <label className={`${labelClass} sm:col-span-2`}>
                    Question
                    <input
                      className={fieldClass}
                      defaultValue={faq.question}
                      maxLength={240}
                      minLength={8}
                      name="question"
                      required
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Answer
                    <textarea
                      className={`${fieldClass} min-h-28 py-3`}
                      defaultValue={faq.answer}
                      maxLength={2000}
                      minLength={12}
                      name="answer"
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Display order
                    <input
                      className={fieldClass}
                      defaultValue={faq.sortOrder}
                      max={10000}
                      min={0}
                      name="sortOrder"
                      required
                      type="number"
                    />
                  </label>
                  <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
                    <input
                      className="size-4 accent-primary"
                      defaultChecked={faq.isPublished}
                      name="isPublished"
                      type="checkbox"
                    />
                    Publish on home page
                  </label>
                  <div className="flex flex-wrap gap-3 sm:col-span-2">
                    <Button disabled={pending !== null} type="submit">
                      {pending === faq.id ? "Saving…" : "Save FAQ"}
                    </Button>
                    <Button
                      disabled={pending !== null}
                      onClick={() =>
                        remove(`/api/admin/faqs/${faq.id}`, "FAQ entry")
                      }
                      type="button"
                      variant="outline"
                    >
                      Delete FAQ
                    </Button>
                  </div>
                </form>
              </details>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
