import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { categories, getArticlesByCategory, getCategoryMeta, type Category } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArticleArtwork } from "@/components/ArticleArtwork";

export const dynamic = "force-dynamic";
export function generateStaticParams(){return categories.map(category=>({category}))}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const{category}=await params;if(!categories.includes(category as Category))return{};const meta=await getCategoryMeta(category as Category);return{title:meta.title,description:meta.description,alternates:{canonical:`/category/${category}`}}}
export default async function CategoryPage({params}:{params:Promise<{category:string}>}){const{category}=await params;if(!categories.includes(category as Category))notFound();const key=category as Category;const [meta,items]=await Promise.all([getCategoryMeta(key),getArticlesByCategory(key)]);return <main><SiteHeader/><section className="category-hero shell"><span className="kicker">KITSUWIRE / {meta.title.toUpperCase()}</span><h1>{meta.title}</h1><p>{meta.description}</p></section><section className="category-list shell">{items.map((article,index)=><Link className="category-story" href={`/article/${article.slug}`} key={article.slug}><span className="story-index">{String(index+1).padStart(2,"0")}</span><div><span className="category">{article.categoryLabel} · {article.readingTime}</span><h2>{article.title}</h2><p>{article.excerpt}</p></div><ArticleArtwork article={article} compact/><ArrowRight className="category-arrow"/></Link>)}</section><SiteFooter/></main>}
