"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Action =
  | "START_REVIEW"
  | "REQUEST_CHANGES"
  | "REJECT"
  | "APPROVE"
  | "APPROVE_AND_PUBLISH";

export function SubmissionReviewActions({
  submissionId,
  status,
}: {
  submissionId: string;
  status: string;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(action: Action) {
    if ((action === "REQUEST_CHANGES" || action === "REJECT") && !reason.trim()) {
      setError("Add a reason before requesting changes or rejecting.");
      return;
    }
    const label =
      action === "START_REVIEW"
        ? "start reviewing"
        : action === "APPROVE_AND_PUBLISH"
          ? "approve and publish"
          : action === "APPROVE"
            ? "approve as a draft"
            : action === "REJECT"
              ? "reject"
              : "request changes for";
    if (!window.confirm(`Confirm: ${label} this submission?`)) return;
    setPending(true);
    setError("");
    const formData = new FormData();
    formData.set("action", action);
    formData.set("reason", reason);
    const response = await fetch(`/api/admin/submissions/${submissionId}`, { method: "POST", body: formData });
    const result: unknown = await response.json();
    if (!response.ok) {
      setError(typeof result === "object" && result !== null && "error" in result && typeof result.error === "string" ? result.error : "The review action failed.");
      setPending(false);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="grid gap-4 border-t border-border pt-6">
      {status === "SUBMITTED" || status === "RESUBMITTED" ? (
        <Button
          disabled={pending}
          onClick={() => void submit("START_REVIEW")}
          type="button"
        >
          Start review
        </Button>
      ) : (
        <>
          <label className="grid gap-2 text-sm font-semibold">
            Reviewer note
            <span className="font-normal text-muted-foreground">
              Required for changes or rejection
            </span>
            <textarea
              className="min-h-28 rounded-xl border border-border bg-background p-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </label>
          {error && (
            <p
              aria-live="assertive"
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={pending}
              onClick={() => void submit("REQUEST_CHANGES")}
              type="button"
              variant="outline"
            >
              Request changes
            </Button>
            <Button
              disabled={pending}
              onClick={() => void submit("REJECT")}
              type="button"
              variant="outline"
            >
              Reject
            </Button>
            <Button
              disabled={pending}
              onClick={() => void submit("APPROVE")}
              type="button"
              variant="secondary"
            >
              Approve as draft
            </Button>
            <Button
              disabled={pending}
              onClick={() => void submit("APPROVE_AND_PUBLISH")}
              type="button"
            >
              Approve and publish
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
