"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Staff = { id: string; displayName: string | null; email: string; role: string };

export function EnquiryAssignment({ id, assignedAdminId, staff }: { id: string; assignedAdminId: string | null; staff: Staff[] }) {
  const [assignee, setAssignee] = useState(assignedAdminId ?? "");
  const [state, setState] = useState("");
  async function save() {
    setState("Saving...");
    const response = await fetch(`/api/admin/enquiries/${id}/assignment`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ assignedAdminId: assignee || null }) });
    setState(response.ok ? "Saved" : "Could not save");
    if (response.ok) window.location.reload();
  }
  return <div className="mt-4 grid gap-2 border-t border-border pt-4"><label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Assigned to<select className="min-h-10 rounded-lg border border-border bg-background px-2 text-sm font-normal normal-case tracking-normal" value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="">Unassigned</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.displayName || person.email} · {person.role.toLowerCase()}</option>)}</select></label><div className="flex items-center gap-3"><Button className="min-h-10" onClick={() => void save()} size="small">Save assignment</Button><span aria-live="polite" className="text-xs text-muted-foreground">{state}</span></div></div>;
}
