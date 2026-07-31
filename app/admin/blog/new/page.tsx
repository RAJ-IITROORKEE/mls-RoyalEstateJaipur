import { redirect } from "next/navigation";

import { BlogEditor } from "@/components/admin/blog-editor";
import { canManageBlog } from "@/features/blog/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export default async function NewBlogPage() {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !canManageBlog(access.profile.role))
    redirect("/");
  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Editorial studio
        </p>
        <h1 className="mt-2 font-serif text-4xl">New blog</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Create a draft, preview it, then publish after review.
        </p>
      </header>
      <BlogEditor />
    </section>
  );
}
