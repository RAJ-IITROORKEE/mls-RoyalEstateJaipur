import {
  ArrowUpRight,
  Bell,
  Building2,
  ClipboardList,
  Database,
  Inbox,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { getAdminDashboardSummary } from "@/features/admin/queries";
import { formatDate } from "@/lib/utils";

const metrics = [
  ["Pending review", "pendingSubmissions", ClipboardList, "/admin/submissions"],
  ["Published listings", "publishedProperties", Building2, "/admin/properties"],
  ["New enquiries", "newEnquiries", Inbox, "/admin/enquiries"],
  ["Unread notifications", "unreadNotifications", Bell, "/admin/notifications"],
  ["Total users", "totalUsers", Users, "/admin/users"],
] as const;

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();
  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Operations overview
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
            The next useful action.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            A focused view of submissions, inventory, and conversations that
            need attention.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          Updated {formatDate(new Date())}
        </span>
      </header>
      {!summary.connected && (
        <section className="flex flex-col gap-4 rounded-2xl border border-accent/50 bg-accent/15 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Database
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-primary"
            />
            <div>
              <h2 className="font-bold">Connect the workspace database</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                The admin shell is ready. Add the Supabase pooled `DATABASE_URL`
                and SSR keys to replace these empty states with live operational
                counts.
              </p>
            </div>
          </div>
          <Link
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            href="/admin/settings"
          >
            Open setup notes
          </Link>
        </section>
      )}
      <section
        aria-label="Operational counts"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        {metrics.map(([label, key, Icon, href]) => (
          <Link
            className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
            href={href}
            key={label}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-muted text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 text-muted-foreground transition group-hover:text-primary"
              />
            </div>
            <p className="mt-7 text-sm font-semibold text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {summary[key]}
            </p>
          </Link>
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Queue
              </p>
              <h2 className="mt-2 text-xl font-bold">Recent activity</h2>
            </div>
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
          </div>
          {summary.recentActivity.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
              <ClipboardList
                aria-hidden="true"
                className="mx-auto size-6 text-muted-foreground"
              />
              <p className="mt-3 font-semibold">No activity recorded yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Audit events will appear here after the first privileged
                workflow.
              </p>
            </div>
          ) : (
            <ol className="mt-6 divide-y divide-border">
              {summary.recentActivity.map((item) => (
                <li className="flex gap-3 py-4 first:pt-0" key={item.id}>
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-semibold">{item.summary}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.action} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <Link
            className="mt-5 inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm font-bold hover:bg-muted"
            href="/admin/audit"
          >
            Show all activity
          </Link>
        </section>
        <section className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Review principle
          </p>
          <h2 className="mt-8 font-serif text-3xl leading-tight">
            Moderation and verification are different decisions.
          </h2>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
            Approval means the submission passed your review. It does not make
            an unverified legal claim about the property.
          </p>
          <Link
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent"
            href="/admin/submissions"
          >
            Open submission queue{" "}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
