import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllArticles } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArticleArtwork } from "@/components/ArticleArtwork";

export const dynamic = "force-dynamic";
export const metadata:Metadata={title:"All Articles",description:"Browse all KitsuWire articles across AI, technology, software and markets.",alternates:{canonical:"/articles"}};
export default async function ArticlesPage(){const articles=await getAllArticles();return <main><SiteHeader/><section className="category-hero shell"><span className="kicker">KITSUWIRE ARCHIVE</span><h1>All Articles</h1><p>Clear guides and analysis across AI, technology, software and markets.</p></section><section className="category-list shell">{articles.map((article,index)=><Link className="category-story" href={`/article/${article.slug}`} key={article.slug}><span className="story-index">{String(index+1).padStart(2,"0")}</span><div><span className="category">{article.categoryLabel} · {article.readingTime}</span><h2>{article.title}</h2><p>{article.excerpt}</p></div><ArticleArtwork article={article} compact/><ArrowRight/></Link>)}</section><SiteFooter/></main>}
