import Image from "next/image";
import Link from "next/link";

import { UserAccessActions } from "@/components/admin/user-access-actions";
import { getManageableProfiles } from "@/features/admin/users";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { getPublicAvatarUrl } from "@/lib/supabase/public-avatar-url";
import { hasDatabaseConfiguration } from "@/lib/env";
import { canManageStaff } from "@/lib/permissions/roles";
import { formatDate } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const access = await getCurrentUserAccess();
  if (
    access.mode !== "authorized" ||
    !access.profile ||
    !canManageStaff(access.profile.role)
  )
    return (
      <section className="space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Access
          </p>
          <h1 className="mt-2 font-serif text-4xl">Users</h1>
        </header>
        <div className="rounded-2xl border border-dashed border-border p-8">
          <h2 className="font-serif text-3xl">Super-admin access required.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Role and status changes are restricted to active super admins and
            protected by last-admin safeguards.
          </p>
        </div>
      </section>
    );

  const params = await searchParams;
  const query = first(params.q)?.trim() ?? "";
  const requestedPage = Number(first(params.page) ?? "1");
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const result = hasDatabaseConfiguration()
    ? await getManageableProfiles(query, page)
    : { connected: false as const, profiles: [], total: 0, page, pageSize: 20 };
  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Access
        </p>
        <h1 className="mt-2 font-serif text-4xl">Users and staff</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Search verified identities, assign staff access, or suspend an
          account. Every change is audited.
        </p>
      </header>
      {!result.connected ? (
        <div className="rounded-2xl border border-dashed border-border p-8">
          <h2 className="font-serif text-3xl">Connect the workspace database.</h2>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            href="/admin/settings"
          >
            Open setup notes
          </Link>
        </div>
      ) : (
        <>
          <form className="flex flex-col gap-3 sm:flex-row" method="get">
            <label className="sr-only" htmlFor="user-search">
              Search users
            </label>
            <input
              className="min-h-11 flex-1 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={query}
              id="user-search"
              name="q"
              placeholder="Search by name or email"
            />
            <button
              className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
              type="submit"
            >
              Search
            </button>
          </form>
          {result.profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8">
              <h2 className="font-serif text-3xl">No profiles found.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Profiles are created from verified Auth sessions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-left text-sm">
                <caption className="sr-only">Users and staff access</caption>
                <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-bold">Profile</th>
                    <th className="px-5 py-4 font-bold">Email</th>
                    <th className="px-5 py-4 font-bold">Role</th>
                    <th className="px-5 py-4 font-bold">Joined</th>
                    <th className="px-5 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.profiles.map((profile) => {
                    const avatarUrl = getPublicAvatarUrl(profile.avatarPath);
                    return (
                      <tr className="align-middle" key={profile.id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground">
                              {avatarUrl ? (
                                <Image
                                  alt=""
                                  className="size-full object-cover"
                                  height={40}
                                  src={avatarUrl}
                                  width={40}
                                />
                              ) : (
                                (profile.displayName ?? profile.email)
                                  .slice(0, 1)
                                  .toUpperCase()
                              )}
                            </span>
                            <span>
                              <span className="block font-semibold">
                                {profile.displayName || "Unnamed profile"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {profile.status}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {profile.email}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">
                            {profile.role.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                          {formatDate(profile.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <UserAccessActions
                            profileId={profile.id}
                            role={profile.role}
                            status={profile.status}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {pageCount > 1 && (
            <nav aria-label="User pages" className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Page {result.page} of {pageCount}
              </span>
              <div className="flex gap-2">
                {result.page > 1 && (
                  <Link
                    className="rounded-xl border border-border px-4 py-2 text-sm font-bold"
                    href={`/admin/users?${new URLSearchParams({ q: query, page: String(result.page - 1) })}`}
                  >
                    Previous
                  </Link>
                )}
                {result.page < pageCount && (
                  <Link
                    className="rounded-xl border border-border px-4 py-2 text-sm font-bold"
                    href={`/admin/users?${new URLSearchParams({ q: query, page: String(result.page + 1) })}`}
                  >
                    Next
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
