"use client";

import { Archive, Edit3, MoreHorizontal, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getAllowedPropertyStatuses } from "@/features/properties/lifecycle";
import type { PropertyStatus } from "@/features/properties/domain";

type Props = {
  propertyId: string;
  status: PropertyStatus;
  isFeatured: boolean;
};

export function PropertyInventoryActions({
  propertyId,
  status,
  isFeatured,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function mutate(body: object, confirmation?: string) {
    if (confirmation && !window.confirm(confirmation)) return;
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/admin/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(result?.error ?? "The property could not be updated.");
      return;
    }
    setMessage("Property updated.");
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <Button
        aria-expanded={open}
        aria-label="Property actions"
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
        size="icon"
        variant="ghost"
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-border bg-card p-3 text-left shadow-xl">
          <Link
            className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={`/admin/properties/${propertyId}`}
          >
            <Edit3 aria-hidden="true" className="size-4" />
            Edit full listing
          </Link>
          <label className="mt-2 grid gap-1 border-t border-border pt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Lifecycle status
            <select
              className="min-h-10 rounded-lg border border-border bg-background px-2 text-sm font-normal normal-case tracking-normal text-foreground"
              defaultValue={status}
              disabled={pending}
              onChange={(event) => {
                const nextStatus = event.target.value as PropertyStatus;
                void mutate(
                  { kind: "status", status: nextStatus },
                  nextStatus === "ARCHIVED"
                    ? "Archive this property? It will be removed from public discovery."
                    : `Move this property to ${nextStatus.toLowerCase()}?`,
                );
              }}
            >
              {getAllowedPropertyStatuses(status).map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <button
            className="mt-2 flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-bold hover:bg-muted disabled:opacity-50"
            disabled={pending || (status !== "PUBLISHED" && !isFeatured)}
            onClick={() =>
              void mutate({
                kind: "featured",
                isFeatured: !isFeatured,
                featuredRank: isFeatured ? null : 1,
              })
            }
            type="button"
          >
            {isFeatured ? (
              <Archive aria-hidden="true" className="size-4" />
            ) : (
              <Star aria-hidden="true" className="size-4" />
            )}
            {isFeatured ? "Remove from featured" : "Mark as featured"}
          </button>
          {message ? (
            <p
              aria-live="polite"
              className="mt-2 text-xs leading-5 text-muted-foreground"
            >
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
