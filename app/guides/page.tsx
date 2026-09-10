import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllArticles } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArticleArtwork } from "@/components/ArticleArtwork";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata=pageMetadata({title:"Guides",description:"Clear KitsuWire guides to AI, technology, software and markets.",path:"/guides"});

export default async function Guides(){
  const guides=(await getAllArticles()).filter(article=>/^(what|how|why|ci-cd|containers|microservices)/i.test(article.slug)).slice(0,16);
  return <main><SiteHeader/><section className="category-hero shell"><span className="kicker">KITSUWIRE / GUIDES</span><h1>Guides</h1><p>Clear explanations of the systems, tools and market ideas worth understanding.</p></section><section className="shell latest-grid"><div className="cards">{guides.map(article=><article className="story" key={article.slug}><ArticleArtwork article={article} compact/><div className="story-body"><span className="category">{article.categoryLabel.toUpperCase()} · {article.readingTime}</span><h3>{article.title}</h3><p>{article.excerpt}</p><Link href={`/article/${article.slug}`} aria-label={`Read ${article.title}`}><ArrowRight size={18}/></Link></div></article>)}</div></section><SiteFooter/></main>
}
