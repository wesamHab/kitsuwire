import type { MetadataRoute } from "next";
import { articles } from "@/data/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kitsuwire.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...["ai","technology","software","markets"].map((category) => ({ url: `${base}/category/${category}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 })),
    ...articles.map((article) => ({ url: `${base}/article/${article.slug}`, lastModified: new Date(article.publishedAt), changeFrequency: "weekly" as const, priority: article.featured ? 0.9 : 0.7 }))
  ];
}
