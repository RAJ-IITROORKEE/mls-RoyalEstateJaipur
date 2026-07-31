"use client";

import { Archive } from "lucide-react";
import { useState } from "react";

export function AuditArchiveAction({ auditLogId }: { auditLogId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function archive() {
    if (reason.trim().length < 3) return setStatus("Add a reason first.");
    if (!window.confirm("Archive this audit entry from the main view?")) return;
    setBusy(true);
    const response = await fetch("/api/admin/audit", {
      body: JSON.stringify({ auditLogId, reason }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok)
      return setStatus(result.error ?? "Could not archive entry.");
    window.location.reload();
  }

  return (
    <div className="text-right">
      <button
        className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold hover:bg-muted"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Archive aria-hidden="true" className="size-3.5" /> Archive
      </button>
      {open && (
        <div className="mt-2 grid gap-2 sm:flex sm:items-center">
          <label className="sr-only" htmlFor={`archive-reason-${auditLogId}`}>
            Archive reason
          </label>
          <input
            className="min-h-9 rounded-lg border border-border bg-background px-2 text-xs"
            id={`archive-reason-${auditLogId}`}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason"
            value={reason}
          />
          <button
            className="min-h-9 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground disabled:opacity-50"
            disabled={busy}
            onClick={() => void archive()}
            type="button"
          >
            Confirm
          </button>
        </div>
      )}
      {status && <p className="mt-1 text-xs text-destructive">{status}</p>}
    </div>
  );
}
