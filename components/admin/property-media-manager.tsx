"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Media = { id: string; storagePath: string; altText: string; sortOrder: number; isCover: boolean; publicUrl: string | null };

export function PropertyMediaManager({ propertyId, media }: { propertyId: string; media: Media[] }) {
  const [altText, setAltText] = useState("");
  const [state, setState] = useState("");
  async function upload(files: FileList | null) {
    if (!files?.length || altText.trim().length < 3) {
      setState("Add alt text before uploading.");
      return;
    }
    setState(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}...`);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("altText", altText);
      const response = await fetch(`/api/properties/${propertyId}/media`, { method: "POST", body: formData });
      if (!response.ok) {
        setState("An image could not be uploaded.");
        return;
      }
    }
    window.location.reload();
  }
  async function remove(mediaId: string) {
    if (!window.confirm("Remove this public image?")) return;
    const response = await fetch(`/api/properties/${propertyId}/media`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ mediaId }) });
    setState(response.ok ? "Removed" : "Could not remove image");
    if (response.ok) window.location.reload();
  }
  async function update(mediaItem: Media, nextAltText: string, isCover: boolean) {
    const response = await fetch(`/api/properties/${propertyId}/media`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ mediaId: mediaItem.id, altText: nextAltText, sortOrder: mediaItem.sortOrder, isCover }) });
    setState(response.ok ? "Saved" : "Could not save image metadata");
    if (response.ok) window.location.reload();
  }
  return <div className="mt-5 border-t border-border pt-5"><h3 className="text-sm font-bold">Public media</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Images are public only when their storage path is shared. Use accurate alt text.</p><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Alt text<input className="min-h-10 rounded-lg border border-border bg-background px-2 text-sm font-normal normal-case tracking-normal" onChange={(event) => setAltText(event.target.value)} placeholder="Describe the property image" value={altText} /></label><label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground">Add images<input accept="image/jpeg,image/png,image/webp" className="sr-only" multiple onChange={(event) => void upload(event.target.files)} type="file" /></label></div>{media.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{media.map((item) => <div className="rounded-xl border border-border p-3" key={item.id}>{item.publicUrl && <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"><Image alt={item.altText} className="object-cover" fill sizes="(min-width: 640px) 240px, 100vw" src={item.publicUrl} /></div>}<input aria-label={`Alt text for ${item.storagePath}`} className="mt-3 min-h-9 w-full rounded-lg border border-border bg-background px-2 text-xs" defaultValue={item.altText} onBlur={(event) => { if (event.target.value.trim() !== item.altText) void update(item, event.target.value, item.isCover); }} /><div className="mt-2 flex items-center justify-between gap-2"><label className="flex items-center gap-2 text-xs"><input checked={item.isCover} onChange={(event) => void update(item, item.altText, event.target.checked)} type="checkbox" /> Cover image</label><Button className="min-h-8" onClick={() => void remove(item.id)} size="small" variant="ghost">Remove</Button></div></div>)}</div>}<p aria-live="polite" className="mt-3 text-xs text-muted-foreground">{state}</p></div>;
}
