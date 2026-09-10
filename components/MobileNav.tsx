"use client";

import Link from "next/link";
import { Menu, X, Mail, Search } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["Home", "/"], ["AI", "/category/ai"], ["Technology", "/category/technology"],
  ["Software", "/category/software"], ["Markets", "/category/markets"],
  ["Guides", "/guides"], ["Articles", "/articles"], ["About", "/about"]
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return <>
    <button type="button" className="mobile-nav-trigger" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}><Menu size={20}/></button>
    <div className={`mobile-nav-overlay${open ? " is-open" : ""}`} aria-hidden={!open} onClick={() => setOpen(false)} />
    <aside id="mobile-navigation" className={`mobile-nav-drawer${open ? " is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!open}>
      <div className="mobile-nav-head"><span>Explore KitsuWire</span><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20}/></button></div>
      <nav>{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<span>→</span></Link>)}</nav>
      <div className="mobile-nav-actions"><Link href="/search" onClick={() => setOpen(false)}><Search size={17}/> Search KitsuWire</Link><Link className="mobile-nav-subscribe" href="/#newsletter" onClick={() => setOpen(false)}><Mail size={17}/> Subscribe</Link></div>
      <p>AI · Technology · Software · Markets</p>
    </aside>
  </>;
}
