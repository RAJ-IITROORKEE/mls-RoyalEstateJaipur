"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { enquiryStatuses } from "@/features/enquiries/transitions";

export function EnquiryStatusActions({ id, status }: { id: string; status: (typeof enquiryStatuses)[number] }) {
  const [nextStatus, setNextStatus] = useState(status);
  const [note, setNote] = useState("");
  const [state, setState] = useState("");
  async function update() {
    setState("Saving...");
    const response = await fetch(`/api/admin/enquiries/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: nextStatus, note }) });
    setState(response.ok ? "Saved" : "Could not save");
    if (response.ok) window.location.reload();
  }
  return <div className="mt-4 grid gap-2 border-t border-border pt-4"><label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Move status<select className="min-h-10 rounded-lg border border-border bg-background px-2 text-sm font-normal normal-case tracking-normal" value={nextStatus} onChange={(event) => setNextStatus(event.target.value as (typeof enquiryStatuses)[number])}>{enquiryStatuses.map((value) => <option key={value} value={value}>{value.toLowerCase().replaceAll("_", " ")}</option>)}</select></label><label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Internal note<textarea className="min-h-16 rounded-lg border border-border bg-background p-2 text-sm font-normal normal-case tracking-normal" value={note} onChange={(event) => setNote(event.target.value)} /></label><div className="flex items-center gap-3"><Button className="min-h-10" onClick={() => void update()} size="small">Save status</Button><span aria-live="polite" className="text-xs text-muted-foreground">{state}</span></div></div>;
}
