import Link from "next/link";
import { Mail, Search } from "lucide-react";
import { FoxMark } from "./FoxMark";

export function SiteHeader(){return <header className="site-header"><div className="nav shell">
  <Link className="brand" href="/" aria-label="KitsuWire home"><span className="brand-mark"><FoxMark size={31}/></span><span className="brand-lockup"><span className="brand-word">Kitsu<span>Wire</span></span><small>TECH NEWS · CLEARER.</small></span></Link>
  <nav className="nav-links"><Link className="active" href="/">Home</Link><Link href="/category/ai">AI</Link><Link href="/category/technology">Technology</Link><Link href="/category/software">Software</Link><Link href="/category/markets">Markets</Link><Link href="/about">About</Link></nav>
  <div className="nav-actions"><button className="search-pill" aria-label="Search"><Search size={18}/></button><Link className="join" href="/#newsletter"><Mail size={16}/> Subscribe</Link></div>
</div></header>}
