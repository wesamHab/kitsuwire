import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { getAllArticles } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata:Metadata={title:"Search",description:"Search KitsuWire articles."};
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){const{q=""}=await searchParams;const term=q.trim().toLowerCase();const results=term?getAllArticles().filter(article=>[article.title,article.excerpt,article.categoryLabel,...(article.tags??[])].join(" ").toLowerCase().includes(term)):[];return <main><SiteHeader/><section className="info-page shell"><span className="kicker">SEARCH KITSUWIRE</span><h1>Find the signal.</h1><form className="site-search-form" action="/search"><Search size={18}/><input name="q" defaultValue={q} placeholder="Search AI, Kubernetes, markets..." autoFocus/><button type="submit">Search</button></form>{term?<div className="search-results"><p>{results.length} result{results.length===1?"":"s"} for “{q}”</p>{results.map(article=><Link href={`/article/${article.slug}`} key={article.slug}><div><span>{article.categoryLabel} · {article.readingTime}</span><h2>{article.title}</h2><p>{article.excerpt}</p></div><ArrowRight/></Link>)}{results.length===0?<div className="notice-card"><h2>No matching articles yet.</h2><p>Try a broader term such as AI, cloud, Docker, markets or software.</p></div>:null}</div>:<p>Search across all KitsuWire guides and analysis.</p>}</section><SiteFooter/></main>}
