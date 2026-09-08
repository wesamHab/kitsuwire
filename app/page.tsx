import Link from "next/link";
import { ArrowRight, Sparkles, Cpu, Code2, ChartNoAxesCombined, Mail } from "lucide-react";
import { getAllArticles, getFeaturedArticle } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSignal } from "@/components/HeroSignal";

export default function Home(){
 const articles=getAllArticles();
 const featured=getFeaturedArticle();
 if(!featured)return null;
 const latest=articles.filter(a=>a.slug!==featured.slug).slice(0,12);
 const wire=latest.slice(0,4);
 return <main><SiteHeader/>
  <section className="hero shell"><div className="hero-copy-wrap"><div className="eyebrow"><span className="live-dot"/> THE SIGNAL BEHIND WHAT&apos;S NEXT</div><h1>Understand the future<br/>before it becomes <em>obvious.</em></h1><p className="hero-copy">KitsuWire cuts through the noise around AI, technology, software and markets — turning fast-moving change into clear, useful insight.</p><div className="hero-actions"><Link className="primary" href="#latest">Explore the latest <ArrowRight size={18}/></Link><Link className="text-link" href="/about">What is KitsuWire?</Link></div></div><HeroSignal/></section>

  <section className="wire-section shell" aria-label="Latest from KitsuWire"><div className="wire-heading"><div><span className="kicker">ON THE WIRE</span><h2>Worth knowing now.</h2></div><Link href="#latest">View all <ArrowRight size={15}/></Link></div><div className="wire-grid">{wire.map((item,index)=><Link className="wire-card" href={`/article/${item.slug}`} key={item.slug}><div className="wire-card-top"><span>{String(index+1).padStart(2,"0")}</span><span>{item.categoryLabel}</span></div><h3>{item.title}</h3><div className="wire-card-foot"><span>{item.readingTime} read</span><ArrowRight size={16}/></div></Link>)}</div></section>

  <section className="shell featured" id="latest"><div className="section-heading"><div><span className="kicker">FEATURED INTELLIGENCE</span><h2>What matters now.</h2></div></div><article className="lead-card"><div className="lead-visual"><div className="visual-badge"><Sparkles size={18}/> KITSUWIRE SIGNAL</div><div className="visual-type">AI<br/><span>→</span><br/>WORLD</div></div><div className="lead-copy"><span className="category">DEEP DIVE · {featured.categoryLabel}</span><h3>{featured.title}</h3><p>{featured.excerpt}</p><div className="story-meta"><span>{featured.readingTime} read</span></div><Link className="read" href={`/article/${featured.slug}`}>Read the story <ArrowRight size={17}/></Link></div></article></section>

  <section className="shell topics"><div><span className="kicker">EXPLORE THE WIRE</span><h2>Four worlds.<br/>One connected story.</h2></div><div className="topic-grid"><div><Cpu/><span>01</span><h3>Artificial Intelligence</h3><p>Models, agents, companies and infrastructure.</p><Link href="/category/ai">Explore AI →</Link></div><div><Sparkles/><span>02</span><h3>Technology</h3><p>Cloud, containers and infrastructure.</p><Link href="/category/technology">Explore Tech →</Link></div><div><Code2/><span>03</span><h3>Software</h3><p>Developer tools, DevOps and open source.</p><Link href="/category/software">Explore Software →</Link></div><div><ChartNoAxesCombined/><span>04</span><h3>Markets</h3><p>Money and economic forces behind technology.</p><Link href="/category/markets">Explore Markets →</Link></div></div></section>

  <section className="shell latest-grid"><div className="section-heading"><div><span className="kicker">LATEST</span><h2>Fresh from the wire.</h2></div></div><div className="cards">{latest.map(article=><article className="story" key={article.slug}><div className={`story-art ${article.tone}`}><span>{article.categoryLabel.toUpperCase()}</span></div><div className="story-body"><span className="category">{article.categoryLabel.toUpperCase()} · {article.readingTime}</span><h3>{article.title}</h3><p>{article.excerpt}</p><Link href={`/article/${article.slug}`}><ArrowRight size={18}/></Link></div></article>)}</div></section>

  <section className="brief shell" id="newsletter"><div className="brief-icon"><Mail size={24}/></div><div className="brief-copy"><span className="kicker">THE KITSUWIRE BRIEF</span><h2>One sharp briefing.<br/>No information overload.</h2><p>Important shifts across AI, technology, software and markets — selected and explained by KitsuWire.</p></div><form className="brief-form"><label htmlFor="brief-email">Get the brief in your inbox</label><div className="brief-input-row"><input id="brief-email" type="email" placeholder="Email address"/><button type="submit">Join the brief <ArrowRight size={16}/></button></div><small>Free. No spam. Unsubscribe anytime.</small></form></section>
  <SiteFooter/>
 </main>
}
