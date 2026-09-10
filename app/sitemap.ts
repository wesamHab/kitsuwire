import type { MetadataRoute } from "next";
import { categories, getAllArticles, type Category } from "@/lib/articles";

export const dynamic = "force-dynamic";

type EditorialRoute={route:string;changeFrequency:"daily"|"weekly"|"monthly";priority:number;lastModified?:Date};

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base="https://kitsuwire.com";
  const articles=await getAllArticles();
  const latestArticleDate=articles.length?new Date(Math.max(...articles.map(article=>new Date(article.updatedAt??article.publishedAt).getTime()))):undefined;
  const categoryLatest=new Map<Category,Date>();
  for(const category of categories){
    const matching=articles.filter(article=>article.category===category);
    if(matching.length)categoryLatest.set(category,new Date(Math.max(...matching.map(article=>new Date(article.updatedAt??article.publishedAt).getTime()))));
  }
  const editorialRoutes:EditorialRoute[]=[
    {route:"",changeFrequency:"daily",priority:1,lastModified:latestArticleDate},
    {route:"/articles",changeFrequency:"daily",priority:.8,lastModified:latestArticleDate},
    {route:"/guides",changeFrequency:"weekly",priority:.75,lastModified:latestArticleDate},
    {route:"/about",changeFrequency:"monthly",priority:.5},
    {route:"/contact",changeFrequency:"monthly",priority:.4},
    {route:"/privacy",changeFrequency:"monthly",priority:.3},
    {route:"/imprint",changeFrequency:"monthly",priority:.3},
  ];
  return [
    ...editorialRoutes.map(item=>({url:`${base}${item.route}`,changeFrequency:item.changeFrequency,priority:item.priority,...(item.lastModified?{lastModified:item.lastModified}:{})})),
    ...categories.map(category=>({url:`${base}/category/${category}`,lastModified:categoryLatest.get(category),changeFrequency:"daily" as const,priority:.8})),
    ...articles.map(article=>({url:`${base}/article/${article.slug}`,lastModified:new Date(article.updatedAt??article.publishedAt),changeFrequency:"weekly" as const,priority:article.featured?.9:.7}))
  ];
}
