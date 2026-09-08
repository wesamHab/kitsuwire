import Link from "next/link";
import { ArrowRight, BookOpenText, Boxes, Globe2, Zap, Cpu, Code2, ChartNoAxesCombined, Mail } from "lucide-react";
import { getAllArticles, getFeaturedArticle } from "@/lib/articles";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSignal } from "@/components/HeroSignal";
import { ArticleArtwork } from "@/components/ArticleArtwork";

export default function Home(){
  const articles=getAllArticles();
  const featured=getFeaturedArticle();
  if(!featured)return null;
  const latest=articles.filter(a=>a.slug!==featured.slug);
  const wire=latest.slice(0,4);

  return <main className="reference-home">
    <SiteHeader/>

    <section className="reference-hero shell">
      <div className="reference-hero-copy">
        <span className="reference-eyebrow">TECH NEWS. CLEARER.</span>
        <h1>Understand what<br/><em>moves</em> the world.</h1>
        <p>KitsuWire delivers clear, in-depth insights on AI, technology, software and markets — without the noise.</p>
        <div className="reference-actions">
          <Link className="reference-primary" href="#wire">Explore latest articles <ArrowRight size={17}/></Link>
          <Link className="reference-secondary" href="/about">About KitsuWire</Link>
        </div>
        <div className="reference-stats">
          <div><BookOpenText/><span><b>{articles.length}+</b><small>Articles</small></span></div>
          <div><Boxes/><span><b>4</b><small>Categories</small></span></div>
          <div><Globe2/><span><b>Global</b><small>Perspective</small></span></div>
          <div><Zap/><span><b>Clear</b><small>Explainers</small></span></div>
        </div>
      </div>
      <HeroSignal/>
    </section>

    <section className="reference-section shell" id="wire">
      <div className="reference-section-head">
        <div><h2>On the Wire</h2><p>The latest insights, handpicked for you.</p></div>
        <Link href="/category/ai">View all articles <ArrowRight size={15}/></Link>
      </div>
      <div className="reference-wire-grid">
        {wire.map(article=><Link className="reference-news-card" href={`/article/${article.slug}`} key={article.slug}>
          <ArticleArtwork article={article} compact/>
          <div className="reference-news-body">
            <span className={`reference-category cat-${article.category}`}>{article.categoryLabel}</span>
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
            <div className="reference-meta"><span>{new Date(article.publishedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span><span>{article.readingTime} read</span></div>
          </div>
        </Link>)}
      </div>
    </section>

    <section className="reference-section reference-categories shell">
      <div className="reference-section-head"><div><h2>Explore by Category</h2><p>Dive deeper into the topics that matter.</p></div></div>
      <div className="reference-category-grid">
        <Link href="/category/ai" className="reference-category-card reference-cat-ai"><Cpu/><strong>AI</strong><span>Latest in artificial intelligence</span><i><ArrowRight/></i></Link>
        <Link href="/category/technology" className="reference-category-card reference-cat-tech"><Boxes/><strong>Technology</strong><span>Cloud, infrastructure and more</span><i><ArrowRight/></i></Link>
        <Link href="/category/software" className="reference-category-card reference-cat-software"><Code2/><strong>Software</strong><span>Development, DevOps and tools</span><i><ArrowRight/></i></Link>
        <Link href="/category/markets" className="reference-category-card reference-cat-markets"><ChartNoAxesCombined/><strong>Markets</strong><span>Stocks, economy and global trends</span><i><ArrowRight/></i></Link>
      </div>
    </section>

    <section className="reference-feature shell">
      <ArticleArtwork article={featured}/>
      <div className="reference-feature-copy">
        <span className="reference-featured-label">FEATURED</span>
        <h2>{featured.title}</h2>
        <p>{featured.excerpt}</p>
        <div className="reference-meta"><span>{new Date(featured.publishedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span><span>{featured.readingTime} read</span></div>
      </div>
      <Link href={`/article/${featured.slug}`} className="reference-feature-arrow" aria-label={`Read ${featured.title}`}><ArrowRight/></Link>
    </section>

    <section className="reference-newsletter shell" id="newsletter">
      <div className="reference-newsletter-icon"><Mail/></div>
      <div className="reference-newsletter-copy"><h2>Get the best tech insights, weekly.</h2><p>No spam. Just clear, valuable content.</p></div>
      <form className="reference-newsletter-form"><input type="email" placeholder="you@example.com" aria-label="Email address"/><button type="submit">Subscribe <ArrowRight size={15}/></button></form>
    </section>

    <footer className="reference-footer shell"><span>© {new Date().getFullYear()} KitsuWire</span><nav><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/imprint">Imprint</Link></nav></footer>
  </main>
}
