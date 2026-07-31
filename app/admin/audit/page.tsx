import { Database, History } from "lucide-react";

import { AuditArchiveAction } from "@/components/admin/audit-archive-action";
import { getAuditEntries } from "@/features/admin/audit-queries";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditPage() {
  const access = await getCurrentUserAccess();
  const result = await getAuditEntries();
  const canArchive =
    access.mode === "authorized" && access.profile.role === "SUPER_ADMIN";
  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Accountability
        </p>
        <h1 className="mt-2 font-serif text-4xl">Audit history</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Privileged state changes are append-only. Archiving removes an entry
          from this view without deleting evidence.
        </p>
      </header>
      {!result.connected ? (
        <div className="rounded-2xl border border-dashed border-border p-8">
          <Database aria-hidden="true" className="size-6 text-primary" />
          <h2 className="mt-5 font-serif text-3xl">
            Connect the workspace database.
          </h2>
        </div>
      ) : result.entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8">
          <History aria-hidden="true" className="size-6 text-primary" />
          <h2 className="mt-5 font-serif text-3xl">No visible audit events.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Archived entries remain preserved in the database.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="divide-y divide-border">
            {result.entries.map((entry) => (
              <article
                className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
                key={entry.id}
              >
                <div>
                  <p className="text-sm font-bold">{entry.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.action} · {entry.entityType}
                    {entry.actor
                      ? ` · ${entry.actor.displayName || entry.actor.email}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={entry.createdAt.toISOString()}
                  >
                    {formatDate(entry.createdAt)}
                  </time>
                  {canArchive && (
                    <div className="mt-2">
                      <AuditArchiveAction auditLogId={entry.id} />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
