import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Auto-generated sitemap at /sitemap.xml
 * Submit this URL to Google Search Console for faster indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static homepage — highest priority
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: siteConfig.url,
          fr: siteConfig.url,
        },
      },
    },
  ];

  // Dynamic routes per category (helps Google find filtered product pages)
  const categoryRoutes: MetadataRoute.Sitemap = siteConfig.categories.map(
    (category) => ({
      url: `${siteConfig.url}/?category=${encodeURIComponent(category)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [...staticRoutes, ...categoryRoutes];
}
