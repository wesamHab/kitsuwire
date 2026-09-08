import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer shell">
      <Link className="brand footer-brand" href="/"><span className="brand-mark">K</span><span>KITSU<span>WIRE</span></span></Link>
      <p>Clear intelligence for a fast-moving world.</p>
      <div><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/imprint">Imprint</Link></div>
      <span>© 2026 KitsuWire</span>
    </footer>
  );
}
