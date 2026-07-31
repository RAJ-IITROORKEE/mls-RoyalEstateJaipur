import type { MetadataRoute } from "next";

import { getPublishedPropertySlugs } from "@/features/properties/queries";
import { getPublishedBlogSlugs } from "@/features/blog/service";
import { getEnvironment } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { NEXT_PUBLIC_SITE_URL: siteUrl } = getEnvironment();
  const staticRoutes = [
    "",
    "/properties",
    "/blogs",
    "/localities",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  const slugs = await getPublishedPropertySlugs();
  const blogSlugs = await getPublishedBlogSlugs();
  return [
    ...staticRoutes,
    ...slugs.map((slug) => ({
      url: `${siteUrl}/properties/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${siteUrl}/blogs/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
