import Link from "next/link";

import { SettingControl } from "@/components/admin/setting-control";
import { getAdminSettings } from "@/features/admin/settings";
import { hasDatabaseConfiguration } from "@/lib/env";

export default async function AdminSettingsPage() {
  const result = hasDatabaseConfiguration()
    ? await getAdminSettings()
    : { connected: false as const, settings: [] };
  const fontFamilySetting = result.settings.find(
    (setting) => setting.key === "appearance.fontFamily",
  );

  return (
    <section className="mx-auto w-full max-w-3xl space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Appearance
        </p>
        <h1 className="mt-2 font-serif text-4xl">Site typography</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Choose the body and display-font pair used across the entire site.
          Preview a selection before applying it.
        </p>
      </header>
      {!result.connected ? (
        <div className="rounded-2xl border border-dashed border-border p-8">
          <h2 className="font-serif text-3xl">Database connection required</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Connect the application database to save a site-wide typography
            preference.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            href="/admin"
          >
            Back to admin
          </Link>
        </div>
      ) : fontFamilySetting ? (
        <SettingControl
          description={fontFamilySetting.description}
          initialValue={String(fontFamilySetting.value)}
          settingKey={fontFamilySetting.key}
        />
      ) : null}
    </section>
  );
}
