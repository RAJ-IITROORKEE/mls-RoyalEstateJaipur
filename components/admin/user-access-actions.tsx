"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

const roles = ["USER", "REVIEWER", "ADMIN", "SUPER_ADMIN"] as const;
const statuses = ["ACTIVE", "SUSPENDED"] as const;

export function UserAccessActions({
  profileId,
  role,
  status,
}: {
  profileId: string;
  role: (typeof roles)[number];
  status: (typeof statuses)[number];
}) {
  const [open, setOpen] = useState(false);
  const [nextRole, setNextRole] = useState(role);
  const [nextStatus, setNextStatus] = useState(status);
  const [state, setState] = useState("");

  async function save(statusOverride = nextStatus) {
    if (!window.confirm("Apply this access change? The action will be audited."))
      return;
    setState("Saving...");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileId, role: nextRole, status: statusOverride }),
    });
    const result = (await response.json()) as { error?: string };
    setState(response.ok ? "Saved" : (result.error ?? "Could not save"));
    if (response.ok) window.location.reload();
  }

  return (
    <div className="relative flex justify-end">
      <button
        aria-expanded={open}
        aria-label="Open user actions"
        className="grid size-10 place-items-center rounded-xl border border-border hover:bg-muted"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-10 w-64 rounded-2xl border border-border bg-card p-4 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Update access
          </p>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1 text-xs font-semibold">
              Role
              <select
                className="min-h-10 rounded-lg border border-border bg-background px-2 text-sm"
                onChange={(event) =>
                  setNextRole(event.target.value as (typeof roles)[number])
                }
                value={nextRole}
              >
                {roles.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold">
              Status
              <select
                className="min-h-10 rounded-lg border border-border bg-background px-2 text-sm"
                onChange={(event) =>
                  setNextStatus(event.target.value as (typeof statuses)[number])
                }
                value={nextStatus}
              >
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="min-h-10 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground"
              onClick={() => void save()}
              type="button"
            >
              Save changes
            </button>
            {status === "ACTIVE" && (
              <button
                className="min-h-10 rounded-lg border border-destructive/40 px-3 text-sm font-bold text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setNextStatus("SUSPENDED");
                  void save("SUSPENDED");
                }}
                type="button"
              >
                Delete access (suspend)
              </button>
            )}
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {state}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
