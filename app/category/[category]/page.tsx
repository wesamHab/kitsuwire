import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { categoryMeta, getArticlesByCategory, type Category } from "@/data/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const categories: Category[] = ["ai", "technology", "software", "markets"];

export function generateStaticParams() { return categories.map((category) => ({ category })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  if (!categories.includes(category as Category)) return {};
  const meta = categoryMeta[category as Category];
  return { title: meta.title, description: meta.description, alternates: { canonical: `/category/${category}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!categories.includes(category as Category)) notFound();
  const key = category as Category;
  const meta = categoryMeta[key];
  const items = getArticlesByCategory(key);
  return <main><SiteHeader/><section className="category-hero shell"><span className="kicker">KITSUWIRE / {meta.title.toUpperCase()}</span><h1>{meta.title}</h1><p>{meta.description}</p></section><section className="category-list shell">{items.length ? items.map((article,index)=><Link className="category-story" href={`/article/${article.slug}`} key={article.slug}><span className="story-index">{String(index+1).padStart(2,"0")}</span><div><span className="category">{article.categoryLabel} · {article.readingTime}</span><h2>{article.title}</h2><p>{article.excerpt}</p></div><div className={`mini-art ${article.tone}`}>{article.categoryLabel}</div><ArrowRight className="category-arrow"/></Link>) : <div className="empty-state"><h2>Stories are coming.</h2><p>We are preparing the first KitsuWire intelligence for this desk.</p></div>}</section><SiteFooter/></main>;
}
