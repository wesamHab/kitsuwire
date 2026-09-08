import { ArrowRight, Search, Sparkles, TrendingUp, Cpu, Code2, ChartNoAxesCombined } from "lucide-react";

const stories = [
  { category: "AI", title: "The next AI race is moving beyond bigger models", excerpt: "Why agents, infrastructure and distribution are becoming the new battleground.", time: "6 min", tone: "violet" },
  { category: "TECH", title: "The invisible infrastructure powering the new internet", excerpt: "Inside the data centers, chips and networks behind the next computing cycle.", time: "8 min", tone: "blue" },
  { category: "SOFTWARE", title: "Software is changing from tools into teammates", excerpt: "A practical look at how AI-native products are reshaping everyday workflows.", time: "5 min", tone: "orange" },
  { category: "MARKETS", title: "Why investors are watching compute like a commodity", excerpt: "AI demand is changing how markets think about power, chips and capacity.", time: "7 min", tone: "green" },
];

const signals = ["AI agents move into the enterprise", "Chip demand keeps reshaping infrastructure", "Open-source models gain ground", "Markets reprice the AI buildout"];

export default function Home() {
  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#"><span className="brand-mark">K</span><span>KITSU<span>WIRE</span></span></a>
        <nav className="nav-links"><a href="#ai">AI</a><a href="#technology">Technology</a><a href="#software">Software</a><a href="#markets">Markets</a></nav>
        <div className="nav-actions"><button className="icon-btn" aria-label="Search"><Search size={19}/></button><a className="join" href="#newsletter">Join the wire <ArrowRight size={16}/></a></div>
      </header>

      <section className="hero shell">
        <div className="eyebrow"><span className="live-dot"/> THE SIGNAL BEHIND WHAT'S NEXT</div>
        <h1>Understand the future<br/>before it becomes <em>obvious.</em></h1>
        <p className="hero-copy">KitsuWire cuts through the noise around AI, technology, software and markets — turning fast-moving change into clear, useful insight.</p>
        <div className="hero-actions"><a className="primary" href="#latest">Explore the latest <ArrowRight size={18}/></a><a className="text-link" href="#about">What is KitsuWire?</a></div>
        <div className="orb orb-one"/><div className="orb orb-two"/>
      </section>

      <section className="ticker-wrap">
        <div className="shell ticker"><div className="ticker-label"><TrendingUp size={16}/> LIVE SIGNALS</div>{signals.map((s,i)=><div className="signal" key={s}><span>{String(i+1).padStart(2,"0")}</span>{s}</div>)}</div>
      </section>

      <section className="shell featured" id="latest">
        <div className="section-heading"><div><span className="kicker">FEATURED INTELLIGENCE</span><h2>What matters now.</h2></div><a href="#all">View all stories <ArrowRight size={16}/></a></div>
        <article className="lead-card">
          <div className="lead-visual"><div className="grid-lines"/><div className="visual-badge"><Sparkles size={18}/> KITSUWIRE SIGNAL</div><div className="visual-type">AI<br/><span>→</span><br/>WORLD</div></div>
          <div className="lead-copy"><span className="category">DEEP DIVE · AI</span><h3>AI is no longer just a software story.</h3><p>The biggest technology shift of the decade is colliding with energy, chips, geopolitics and capital markets. Here is the map that connects it all.</p><div className="story-meta"><span>12 min read</span><span>September 8, 2026</span></div><a className="read" href="#">Read the story <ArrowRight size={17}/></a></div>
        </article>
      </section>

      <section className="shell topics">
        <div className="topic-title"><span className="kicker">EXPLORE THE WIRE</span><h2>Four worlds.<br/>One connected story.</h2></div>
        <div className="topic-grid">
          <div><Cpu/><span>01</span><h3>Artificial Intelligence</h3><p>Models, agents, companies and the infrastructure powering the AI era.</p><a href="#ai">Explore AI →</a></div>
          <div><Sparkles/><span>02</span><h3>Technology</h3><p>The products, platforms and breakthroughs changing how the world works.</p><a href="#technology">Explore Tech →</a></div>
          <div><Code2/><span>03</span><h3>Software</h3><p>Developer tools, cloud, open source and the new software stack.</p><a href="#software">Explore Software →</a></div>
          <div><ChartNoAxesCombined/><span>04</span><h3>Markets</h3><p>The money, businesses and economic forces behind technological change.</p><a href="#markets">Explore Markets →</a></div>
        </div>
      </section>

      <section className="shell latest-grid">
        <div className="section-heading"><div><span className="kicker">LATEST</span><h2>Fresh from the wire.</h2></div></div>
        <div className="cards">{stories.map((story)=><article className="story" key={story.title}><div className={`story-art ${story.tone}`}><span>{story.category}</span></div><div className="story-body"><span className="category">{story.category} · {story.time}</span><h3>{story.title}</h3><p>{story.excerpt}</p><a href="#" aria-label={`Read ${story.title}`}><ArrowRight size={18}/></a></div></article>)}</div>
      </section>

      <section className="newsletter shell" id="newsletter"><div><span className="kicker light">THE KITSUWIRE BRIEF</span><h2>The important stuff.<br/>None of the noise.</h2><p>A sharp briefing on the shifts worth understanding across AI, tech, software and markets.</p></div><form><input type="email" placeholder="you@example.com" aria-label="Email address"/><button type="submit">Join free <ArrowRight size={17}/></button><small>No spam. Just signal.</small></form></section>

      <footer className="footer shell"><a className="brand footer-brand" href="#"><span className="brand-mark">K</span><span>KITSU<span>WIRE</span></span></a><p>Clear intelligence for a fast-moving world.</p><div><a href="#">About</a><a href="#">Contact</a><a href="#">Privacy</a><a href="#">Imprint</a></div><span>© 2026 KitsuWire</span></footer>
    </main>
  );
}
