import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark">K</span><span>KITSU<span>WIRE</span></span></Link>
      <nav className="nav-links">
        <Link href="/category/ai">AI</Link>
        <Link href="/category/technology">Technology</Link>
        <Link href="/category/software">Software</Link>
        <Link href="/category/markets">Markets</Link>
      </nav>
      <div className="nav-actions"><button className="icon-btn" aria-label="Search"><Search size={19}/></button><Link className="join" href="/#newsletter">Join the wire <ArrowRight size={16}/></Link></div>
    </header>
  );
}
