import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getAdminBlogPosts, canManageBlog } from "@/features/blog/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export default async function AdminBlogPage() {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !canManageBlog(access.profile.role))
    redirect("/");
  const posts = await getAdminBlogPosts();
  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Editorial studio
          </p>
          <h1 className="mt-2 font-serif text-4xl">Blogs</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Write clear local guidance and publish it when reviewed.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
          href="/admin/blog/new"
        >
          New blog
        </Link>
      </header>
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8">
          <h2 className="font-serif text-3xl">No drafts yet.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Start a useful story for property owners and buyers.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
            <span>Title</span>
            <span>Author</span>
            <span>Status</span>
            <span>Updated</span>
          </div>
          {posts.map((post) => (
            <Link
              className="grid gap-3 border-b border-border p-5 last:border-0 hover:bg-muted/30 sm:grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr] sm:items-center"
              href={`/admin/blog/${post.id}`}
              key={post.id}
            >
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {post.coverUrl && <Image alt={post.coverAsset?.altText ?? ""} className="object-cover" fill sizes="64px" src={post.coverUrl} />}
                </div>
                <div>
                  <p className="font-semibold">{post.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {post.readingMinutes} min read
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {post.author.displayName || post.author.email}
              </p>
              <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-bold">
                {post.status}
              </span>
              <time className="text-xs text-muted-foreground">
                {post.updatedAt.toLocaleDateString("en-IN")}
              </time>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
