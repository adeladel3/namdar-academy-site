import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { listArticles, listCourses, listStaticPages } from "@/lib/db";

/**
 * Dynamic sitemap generated from the DB on every request so newly published
 * courses/articles/pages show up immediately without a rebuild.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE.url}/courses`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/coaching`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/investing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${SITE.url}/courses/investing-hub`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const courseRoutes: MetadataRoute.Sitemap = listCourses({
    status: "published",
  })
    .filter((c) => c.slug !== "investing-hub" && c.slug !== "mon")
    .map((c) => ({
      url: `${SITE.url}/courses/${c.slug}`,
      lastModified: new Date(c.updatedAt || c.publishedAt || c.createdAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const articleRoutes: MetadataRoute.Sitemap = listArticles({
    publishedOnly: true,
  }).map((a) => ({
    url: `${SITE.url}/articles/${a.slug}`,
    lastModified: new Date(a.updatedAt || a.publishedAt || a.createdAt || Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticPageRoutes: MetadataRoute.Sitemap = listStaticPages({
    publishedOnly: true,
  }).map((p) => ({
    url: `${SITE.url}/p/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...courseRoutes,
    ...articleRoutes,
    ...staticPageRoutes,
  ];
}
