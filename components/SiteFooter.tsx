import Link from "next/link";
import { FoxMark } from "./FoxMark";
import { PrivacySettingsLink } from "./PrivacySettingsLink";

export function SiteFooter() {
  return (
    <footer className="footer shell">
      <Link className="brand footer-brand" href="/"><span className="brand-mark"><FoxMark size={25}/></span><span className="brand-word">KITSU<span>WIRE</span></span></Link>
      <p>Clear intelligence for a fast-moving world.</p>
      <div><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><PrivacySettingsLink/><Link href="/imprint">Imprint</Link></div>
      <span>© 2026 KitsuWire</span>
    </footer>
  );
}
