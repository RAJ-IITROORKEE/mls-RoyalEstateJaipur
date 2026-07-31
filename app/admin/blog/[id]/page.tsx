import { notFound, redirect } from "next/navigation";

import { BlogEditor } from "@/components/admin/blog-editor";
import { getAdminBlogPost, canManageBlog } from "@/features/blog/service";
import { getCurrentUserAccess } from "@/lib/auth/current-user";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getCurrentUserAccess();
  if (access.mode !== "authorized" || !canManageBlog(access.profile.role))
    redirect("/");
  const post = await getAdminBlogPost((await params).id);
  if (!post) notFound();
  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Editorial studio
        </p>
        <h1 className="mt-2 font-serif text-4xl">Edit blog</h1>
      </header>
      <BlogEditor post={post} />
    </section>
  );
}
