import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { getAllArticles, getArticle } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AdSlot } from "@/components/AdSlot";

export function generateStaticParams(){return getAllArticles().map(({slug})=>({slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const{slug}=await params;const article=getArticle(slug);if(!article)return{};
 return{title:article.seoTitle??article.title,description:article.seoDescription??article.excerpt,alternates:{canonical:`/article/${article.slug}`},openGraph:{title:article.title,description:article.excerpt,type:"article",publishedTime:article.publishedAt,modifiedTime:article.updatedAt}};
}

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const{slug}=await params;const article=getArticle(slug);if(!article)notFound();
 const related=getAllArticles().filter(x=>x.category===article.category&&x.slug!==article.slug).slice(0,3);
 const author=article.author??"KitsuWire Editorial";
 return <main><SiteHeader/><article className="article-page shell">
  <Link className="back-link" href={`/category/${article.category}`}><ArrowLeft size={15}/> {article.categoryLabel}</Link>
  <header className="article-head"><span className="category">{article.categoryLabel} · KITSUWIRE GUIDE</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className="article-byline"><span>By {author}</span><span>{article.readingTime} read</span><span>{new Date(article.publishedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>{article.updatedAt&&<span>Updated {new Date(article.updatedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>}</div></header>
  <div className={`article-hero ${article.tone}`}><span>{article.categoryLabel}</span><strong>THE<br/>SIGNAL</strong></div>
  <div className="article-layout">
   <aside className="article-toc"><span>IN THIS GUIDE</span>{article.sections?.map(section=><a key={section.heading} href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}`}>{section.heading}</a>)}{article.faq?.length?<a href="#faq">FAQ</a>:null}</aside>
   <div className="article-content">
    {article.keyTakeaways?.length?<section className="key-takeaways"><span className="kicker">KEY TAKEAWAYS</span><ul>{article.keyTakeaways.map(item=><li key={item}><CheckCircle2 size={18}/><span>{item}</span></li>)}</ul></section>:null}
    {article.body.map((paragraph,index)=><p key={`intro-${index}`}>{paragraph}</p>)}
    {article.body.length>0&&<AdSlot position="in-article"/>}
    {article.sections?.map((section,index)=>{const id=section.heading.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");return <section className="article-section" id={id} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}{section.bullets?.length?<ul>{section.bullets.map(item=><li key={item}>{item}</li>)}</ul>:null}{index===2?<AdSlot position="in-article"/>:null}</section>})}
    <div className="article-callout"><span>KITSUWIRE TAKE</span><h2>Understand the system behind the headline.</h2><p>The useful question is not only what a technology is, but what problem it solves, what trade-offs it introduces and when it is actually worth using.</p></div>
    {article.faq?.length?<section className="article-faq" id="faq"><span className="kicker">FREQUENTLY ASKED QUESTIONS</span><h2>Questions readers often ask.</h2>{article.faq.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>:null}
    {article.sources?.length?<section className="article-sources"><span className="kicker">SOURCES & FURTHER READING</span><h2>Go deeper.</h2>{article.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={14}/></a>)}</section>:null}
    <AdSlot position="end-article"/>
   </div>
  </div>
  {related.length>0&&<section className="related"><span className="kicker">KEEP READING</span>{related.map(item=><Link href={`/article/${item.slug}`} key={item.slug}><div><span>{item.categoryLabel} · {item.readingTime}</span><h3>{item.title}</h3></div><ArrowRight/></Link>)}</section>}
 </article><SiteFooter/></main>
}
