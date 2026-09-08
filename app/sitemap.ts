import type { MetadataRoute } from "next";
import { categories, getAllArticles } from "@/lib/articles";

export default function sitemap():MetadataRoute.Sitemap{
  const base="https://kitsuwire.com";
  const now=new Date();
  const staticRoutes=["","/articles","/guides","/about","/contact","/privacy","/imprint"];
  return [
    ...staticRoutes.map((route,index)=>({url:`${base}${route}`,lastModified:now,changeFrequency:(index===0?"daily":"monthly") as "daily"|"monthly",priority:index===0?1:.6})),
    ...categories.map(category=>({url:`${base}/category/${category}`,lastModified:now,changeFrequency:"daily" as const,priority:.8})),
    ...getAllArticles().map(article=>({url:`${base}/article/${article.slug}`,lastModified:new Date(article.updatedAt??article.publishedAt),changeFrequency:"weekly" as const,priority:article.featured?.9:.7}))
  ];
}
