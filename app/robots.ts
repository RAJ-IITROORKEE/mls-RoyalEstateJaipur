import type { MetadataRoute } from "next";

import { getEnvironment } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const { NEXT_PUBLIC_SITE_URL: siteUrl } = getEnvironment();
  return { rules: [{ userAgent: "*", allow: ["/", "/properties", "/localities", "/about", "/services", "/contact"], disallow: ["/admin", "/account", "/api", "/auth", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"] }], sitemap: `${siteUrl}/sitemap.xml` };
}
