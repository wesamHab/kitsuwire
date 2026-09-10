import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { getArticle, getRelatedArticles } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AdSlot } from "@/components/AdSlot";
import { ArticleArtwork } from "@/components/ArticleArtwork";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ArticleShare } from "@/components/ArticleShare";
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
const SITE=SITE_URL;
const sectionId=(heading:string)=>heading.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const absoluteUrl=(value:string)=>value.startsWith("http://")||value.startsWith("https://")?value:`${SITE}${value.startsWith("/")?value:`/${value}`}`;

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const{slug}=await params;const article=await getArticle(slug);if(!article)return{};const url=`${SITE}/article/${article.slug}`;
 const image=article.featuredImage?{url:absoluteUrl(article.featuredImage.url),width:article.featuredImage.width??1200,height:article.featuredImage.height??630,alt:article.featuredImage.altText??article.title}:{url:DEFAULT_SOCIAL_IMAGE,width:1200,height:630,alt:`${article.title} — KitsuWire`};
 return{title:article.seoTitle??article.title,description:article.seoDescription??article.excerpt,keywords:article.tags,authors:[{name:article.author??"KitsuWire Editorial"}],alternates:{canonical:url},openGraph:{title:article.seoTitle??article.title,description:article.seoDescription??article.excerpt,type:"article",url,siteName:"KitsuWire",locale:"en_US",publishedTime:article.publishedAt,modifiedTime:article.updatedAt,authors:[article.author??"KitsuWire Editorial"],tags:article.tags,images:[image]},twitter:{card:"summary_large_image",title:article.seoTitle??article.title,description:article.seoDescription??article.excerpt,images:[image.url]},robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}}};
}

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const{slug}=await params;const article=await getArticle(slug);if(!article)notFound();
 const related=await getRelatedArticles(article,4);const author=article.author??"KitsuWire Editorial";const url=`${SITE}/article/${article.slug}`;const schemaImage=article.featuredImage?absoluteUrl(article.featuredImage.url):DEFAULT_SOCIAL_IMAGE;
 const articleSchema={"@context":"https://schema.org","@type":"Article",headline:article.title,description:article.seoDescription??article.excerpt,datePublished:article.publishedAt,dateModified:article.updatedAt??article.publishedAt,inLanguage:"en",isAccessibleForFree:true,author:{"@type":"Organization",name:author},publisher:{"@type":"Organization",name:"KitsuWire",url:SITE},mainEntityOfPage:{"@type":"WebPage","@id":url},keywords:article.tags?.join(", "),articleSection:article.categoryLabel,image:schemaImage};
 const breadcrumbSchema={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:SITE},{"@type":"ListItem",position:2,name:article.categoryLabel,item:`${SITE}/category/${article.category}`},{"@type":"ListItem",position:3,name:article.title,item:url}]};
 const faqSchema=article.faq?.length?{"@context":"https://schema.org","@type":"FAQPage",mainEntity:article.faq.map(item=>({"@type":"Question",name:item.question,acceptedAnswer:{"@type":"Answer",text:item.answer}}))}:null;
 return <main><ReadingProgress/><SiteHeader/><article className="article-page shell">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleSchema)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema)}}/>{faqSchema?<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>:null}
  <Link className="back-link" href={`/category/${article.category}`}><ArrowLeft size={15}/> {article.categoryLabel}</Link>
  <header className="article-head"><span className="category">{article.categoryLabel} · KITSUWIRE GUIDE</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className="article-byline"><span>By {author}</span><span>{article.readingTime} read</span><span>Published {new Date(article.publishedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>{article.updatedAt&&<span>Last updated {new Date(article.updatedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>}</div>{article.tags?.length?<div className="article-tags">{article.tags.map(tag=><span key={tag}>{tag}</span>)}</div>:null}</header>
  <div className="article-hero-art"><ArticleArtwork article={article}/></div>
  <div className="article-layout">
   <aside className="article-toc"><span>IN THIS GUIDE</span>{article.sections?.map(section=><a key={section.heading} href={`#${sectionId(section.heading)}`}>{section.heading}</a>)}{article.faq?.length?<a href="#faq">FAQ</a>:null}<ArticleShare title={article.title}/></aside>
   <div className="article-content">
    {article.keyTakeaways?.length?<section className="key-takeaways"><span className="kicker">KEY TAKEAWAYS</span><ul>{article.keyTakeaways.map(item=><li key={item}><CheckCircle2 size={18}/><span>{item}</span></li>)}</ul></section>:null}
    {article.body.map((paragraph,index)=><p key={`intro-${index}`}>{paragraph}</p>)}
    {related.length>0?<section className="topic-links"><span className="kicker">RELATED CONCEPTS</span><div>{related.slice(0,3).map(item=><Link key={item.slug} href={`/article/${item.slug}`}><span>{item.categoryLabel}</span><strong>{item.title}</strong><ArrowRight size={15}/></Link>)}</div></section>:null}
    {article.body.length>0&&<AdSlot position="in-article"/>}
    {article.sections?.map((section,index)=><section className="article-section" id={sectionId(section.heading)} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}{section.bullets?.length?<ul>{section.bullets.map(item=><li key={item}>{item}</li>)}</ul>:null}{index===2?<AdSlot position="in-article"/>:null}</section>)}
    <div className="article-callout"><span>KITSUWIRE TAKE</span><h2>Understand the system behind the headline.</h2><p>The useful question is not only what a technology or market concept is, but what problem it solves, which incentives shape it, what trade-offs it introduces and when those trade-offs matter.</p></div>
    {article.faq?.length?<section className="article-faq" id="faq"><span className="kicker">FREQUENTLY ASKED QUESTIONS</span><h2>Questions readers often ask.</h2>{article.faq.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>:null}
    {article.sources?.length?<section className="article-sources"><span className="kicker">SOURCES & FURTHER READING</span><h2>Go deeper.</h2>{article.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink size={14}/></a>)}</section>:null}
    <div className="article-share-mobile"><ArticleShare title={article.title}/></div><AdSlot position="end-article"/>
   </div>
  </div>
  {related.length>0&&<section className="related"><span className="kicker">KEEP READING</span>{related.map(item=><Link href={`/article/${item.slug}`} key={item.slug}><div><span>{item.categoryLabel} · {item.readingTime}</span><h3>{item.title}</h3></div><ArrowRight/></Link>)}</section>}
 </article><SiteFooter/></main>
}
