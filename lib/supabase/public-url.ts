export function getPublicPropertyMediaUrl(storagePath: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  const encodedPath = storagePath.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  return `${url}/storage/v1/object/public/property-media/${encodedPath}`;
}
