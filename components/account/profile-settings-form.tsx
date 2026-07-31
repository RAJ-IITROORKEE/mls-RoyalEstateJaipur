"use client";

import { useState } from "react";
import Image from "next/image";

export function ProfileSettingsForm({
  initialName,
  initialPhone,
  initialAvatarUrl,
}: {
  initialName: string;
  initialPhone: string;
  initialAvatarUrl: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("Saving...");
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name, phone }),
    });
    const result = await response.json();
    setBusy(false);
    setStatus(
      response.ok
        ? "Profile saved."
        : (result.error ?? "Profile could not be saved."),
    );
  }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("Uploading image...");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/account/profile/avatar", {
      method: "POST",
      body,
    });
    setBusy(false);
    setStatus(
      response.ok
        ? "Profile image updated. Refreshing..."
        : "Profile image could not be updated.",
    );
    if (response.ok) window.location.reload();
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Profile image
        </p>
        <div className="mt-6 grid size-28 place-items-center overflow-hidden rounded-full bg-muted text-3xl font-bold text-primary">
          {initialAvatarUrl ? (
            <Image
              alt="Profile"
              className="size-full object-cover"
              height={112}
              src={initialAvatarUrl}
              width={112}
            />
          ) : (
            name.slice(0, 1).toUpperCase()
          )}
        </div>
        <label className="mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-border px-4 text-sm font-bold">
          Upload JPG or PNG
          <input
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(event) => void upload(event)}
            type="file"
          />
        </label>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Maximum 5 MB. This image appears in your signed-in menu and dashboard.
        </p>
      </div>
      <form
        className="rounded-2xl border border-border bg-card p-6"
        onSubmit={(event) => void save(event)}
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Personal details
        </p>
        <div className="mt-6 grid gap-5">
          <label className="grid gap-2 text-sm font-semibold">
            Display name
            <input
              className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Email
            <span className="min-h-12 rounded-xl border border-border bg-muted px-3 py-3 font-normal text-muted-foreground">
              Account email is managed by Supabase Auth.
            </span>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Phone number
            <input
              autoComplete="tel"
              className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal"
              inputMode="tel"
              onChange={(event) => setPhone(event.target.value)}
              value={phone}
            />
          </label>
        </div>
        <button
          className="mt-8 min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
          disabled={busy}
          type="submit"
        >
          Save changes
        </button>
        <p aria-live="polite" className="mt-3 text-sm text-muted-foreground">
          {status}
        </p>
      </form>
    </div>
  );
}
