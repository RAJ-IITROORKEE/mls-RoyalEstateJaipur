import Link from "next/link";

import { SettingControl } from "@/components/admin/setting-control";
import { getAdminSettings } from "@/features/admin/settings";
import { hasDatabaseConfiguration } from "@/lib/env";

export default async function AdminSettingsPage() {
  const result = hasDatabaseConfiguration()
    ? await getAdminSettings()
    : { connected: false as const, settings: [] };

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Configuration
        </p>
        <h1 className="mt-2 font-serif text-4xl">Workspace settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Business-facing values are editable only by active administrators and
          every change is audited.
        </p>
      </header>
      {!result.connected ? (
        <div className="rounded-2xl border border-dashed border-border p-8">
          <h2 className="font-serif text-3xl">
            Connect the workspace database.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Settings are currently environment-driven until the database
            connection is available.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            href="/admin"
          >
            Back to overview
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {result.settings.map((setting) => (
            <SettingControl
              description={setting.description}
              initialValue={
                typeof setting.value === "boolean"
                  ? String(setting.value)
                  : String(setting.value)
              }
              key={setting.key}
              settingKey={setting.key}
            />
          ))}
        </div>
      )}
    </section>
  );
}
