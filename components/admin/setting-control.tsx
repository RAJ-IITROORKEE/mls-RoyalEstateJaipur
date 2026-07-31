"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SettingControl({ settingKey, initialValue, description }: { settingKey: string; initialValue: string; description: string | null }) {
  const [value, setValue] = useState(initialValue);
  const [state, setState] = useState("");
  async function save() {
    setState("Saving...");
    const response = await fetch("/api/admin/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: settingKey, value }) });
    setState(response.ok ? "Saved" : "Could not save");
  }
  return <div className="rounded-xl border border-border p-4"><label className="grid gap-2 text-sm font-semibold">{settingKey}<input className="min-h-11 rounded-lg border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" onChange={(event) => setValue(event.target.value)} type={settingKey === "business.email" ? "email" : "text"} value={value} /></label>{description && <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>}<div className="mt-3 flex items-center gap-3"><Button className="min-h-9" onClick={() => void save()} size="small">Save</Button><span aria-live="polite" className="text-xs text-muted-foreground">{state}</span></div></div>;
}
