import Link from "next/link";
import { ArrowRight, Sparkles, Mail, Globe2, BookOpenText, Layers3 } from "lucide-react";
import { getAllArticles, getFeaturedArticle } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSignal } from "@/components/HeroSignal";
import { ArticleArtwork } from "@/components/ArticleArtwork";

export default function Home(){
 const articles=getAllArticles();
 const featured=getFeaturedArticle();
 if(!featured)return null;
 const latest=articles.filter(a=>a.slug!==featured.slug).slice(0,12);
 const wire=latest.slice(0,4);
 return <main><SiteHeader/>
  <section className="hero shell"><div className="hero-copy-wrap"><div className="eyebrow"><span className="live-dot"/> TECH NEWS · CLEARER</div><h1>Understand what<br/><em>moves</em> the world.</h1><p className="hero-copy">Clear, useful intelligence on AI, technology, software and markets — built for people who want to understand what is changing and why it matters.</p><div className="hero-actions"><Link className="primary" href="#latest">Explore latest articles <ArrowRight size={18}/></Link><Link className="text-link" href="/about">About KitsuWire</Link></div><div className="hero-proof"><span><BookOpenText size={17}/><b>{articles.length}+</b><small>Articles</small></span><span><Layers3 size={17}/><b>4</b><small>Categories</small></span><span><Globe2 size={17}/><b>Global</b><small>Perspective</small></span></div></div><HeroSignal/></section>

  <section className="wire-section shell" aria-label="Latest from KitsuWire"><div className="wire-heading"><div><span className="kicker">ON THE WIRE</span><h2>The latest insights, handpicked for you.</h2></div><Link href="#latest">View all articles <ArrowRight size={15}/></Link></div><div className="wire-grid">{wire.map(item=><Link className="wire-card wire-card-visual" href={`/article/${item.slug}`} key={item.slug}><ArticleArtwork article={item} compact/><div className="wire-card-copy"><div className="wire-card-top"><span>{item.categoryLabel}</span><span>{item.readingTime} read</span></div><h3>{item.title}</h3><p className="wire-card-summary">{item.excerpt}</p><div className="wire-card-foot"><span>Read story</span><ArrowRight size={16}/></div></div></Link>)}</div></section>

  <section className="category-showcase shell"><div className="category-showcase-head"><span className="kicker">EXPLORE BY CATEGORY</span><h2>Dive deeper into the topics that matter.</h2></div><div className="category-tiles"><Link className="category-tile tile-ai" href="/category/ai"><span>01</span><strong>AI</strong><small>Models, agents and intelligence</small></Link><Link className="category-tile tile-technology" href="/category/technology"><span>02</span><strong>Technology</strong><small>Cloud, infrastructure and systems</small></Link><Link className="category-tile tile-software" href="/category/software"><span>03</span><strong>Software</strong><small>Development, DevOps and tools</small></Link><Link className="category-tile tile-markets" href="/category/markets"><span>04</span><strong>Markets</strong><small>Money, investing and global trends</small></Link></div></section>

  <section className="shell featured" id="latest"><div className="section-heading"><div><span className="kicker">FEATURED INTELLIGENCE</span><h2>What matters now.</h2></div></div><article className="lead-card"><ArticleArtwork article={featured}/><div className="lead-copy"><span className="category">DEEP DIVE · {featured.categoryLabel}</span><h3>{featured.title}</h3><p>{featured.excerpt}</p><div className="story-meta"><span>{featured.readingTime} read</span></div><Link className="read" href={`/article/${featured.slug}`}>Read the story <ArrowRight size={17}/></Link></div></article></section>

  <section className="shell latest-grid"><div className="section-heading"><div><span className="kicker">LATEST ARTICLES</span><h2>Fresh from the wire.</h2></div></div><div className="cards">{latest.map(article=><article className="story" key={article.slug}><ArticleArtwork article={article} compact/><div className="story-body"><span className="category">{article.categoryLabel.toUpperCase()} · {article.readingTime}</span><h3>{article.title}</h3><p>{article.excerpt}</p><Link href={`/article/${article.slug}`} aria-label={`Read ${article.title}`}><ArrowRight size={18}/></Link></div></article>)}</div></section>

  <section className="brief shell" id="newsletter"><div className="brief-icon"><Mail size={24}/></div><div className="brief-copy"><span className="kicker">THE KITSUWIRE BRIEF</span><h2>One sharp briefing.<br/>No information overload.</h2><p>Important shifts across AI, technology, software and markets — selected and explained by KitsuWire.</p></div><form className="brief-form"><label htmlFor="brief-email">Get the brief in your inbox</label><div className="brief-input-row"><input id="brief-email" type="email" placeholder="Email address"/><button type="submit">Join the brief <ArrowRight size={16}/></button></div><small>Free. No spam. Unsubscribe anytime.</small></form></section>
  <SiteFooter/>
 </main>
}
