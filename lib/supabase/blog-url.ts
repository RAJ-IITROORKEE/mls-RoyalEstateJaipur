import { getEnvironment } from "@/lib/env";

export function getPublicBlogMediaUrl(storagePath: string) {
  const { NEXT_PUBLIC_SUPABASE_URL } = getEnvironment();
  if (!NEXT_PUBLIC_SUPABASE_URL) return null;
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-media/${encodedPath}`;
}
