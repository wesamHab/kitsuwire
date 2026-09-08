import Link from "next/link";
import { Mail, Search } from "lucide-react";
import { FoxMark } from "./FoxMark";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader(){return <header className="site-header reference-header"><div className="nav shell reference-nav">
  <Link className="brand reference-brand" href="/" aria-label="KitsuWire home"><span className="brand-mark reference-brand-mark"><FoxMark size={32}/></span><span className="brand-lockup"><span className="brand-word">Kitsu<span>Wire</span></span><small>TECH NEWS. CLEARER.</small></span></Link>
  <nav className="nav-links reference-nav-links"><Link className="active" href="/">Home</Link><Link href="/category/ai">AI</Link><Link href="/category/technology">Technology</Link><Link href="/category/software">Software</Link><Link href="/category/markets">Markets</Link><Link href="/guides">Guides</Link><Link href="/articles">Articles</Link><Link href="/about">About</Link></nav>
  <div className="nav-actions reference-nav-actions"><Link className="search-pill" href="/search" aria-label="Search"><Search size={17}/></Link><ThemeToggle/><Link className="join reference-subscribe" href="/#newsletter"><Mail size={15}/> Subscribe</Link></div>
</div></header>}
