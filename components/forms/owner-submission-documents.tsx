"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";

export function OwnerSubmissionDocuments({ submissionId }: { submissionId: string }) {
  const [status, setStatus] = useState("");
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Uploading...");
    const response = await fetch(`/api/submissions/${submissionId}/documents`, { method: "POST", body: new FormData(event.currentTarget) });
    const result: unknown = await response.json();
    if (!response.ok || typeof result !== "object" || result === null || !("document" in result)) {
      setStatus(typeof result === "object" && result !== null && "error" in result && typeof result.error === "string" ? result.error : "Upload failed.");
      return;
    }
    event.currentTarget.reset();
    setStatus("Document uploaded.");
  }
  return <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Private documents</p><h2 className="mt-3 font-serif text-3xl">Support the review.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Upload a PDF, JPG, or PNG up to 10 MB. Documents remain private and are not public listing media.</p><form className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(event) => void upload(event)}><label className="grid gap-2 text-sm font-semibold">Document type<input className="min-h-11 rounded-xl border border-border bg-background px-3 font-normal" name="documentType" placeholder="Ownership proof" required /></label><label className="grid gap-2 text-sm font-semibold">File<input className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 font-normal" accept="application/pdf,image/jpeg,image/png" name="file" required type="file" /></label><Button className="min-h-11" type="submit">Upload</Button></form><p aria-live="polite" className="mt-3 text-xs text-muted-foreground">{status}</p></section>;
}
