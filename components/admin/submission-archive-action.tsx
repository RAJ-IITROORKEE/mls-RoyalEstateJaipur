"use client";

import { Archive } from "lucide-react";

export function SubmissionArchiveAction({ submissionId }: { submissionId: string }) {
  async function archive() {
    if (!window.confirm("Archive this completed submission?")) return;
    const response = await fetch(`/api/admin/submissions/${submissionId}/archive`, { method: "POST" });
    if (response.ok) window.location.reload();
  }
  return <button aria-label="Archive submission" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={(event) => { event.preventDefault(); void archive(); }} type="button"><Archive aria-hidden="true" className="size-4" /></button>;
}
