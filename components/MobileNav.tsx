"use client";

import Link from "next/link";
import { Menu, X, Mail, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Home", "/"], ["AI", "/category/ai"], ["Technology", "/category/technology"],
  ["Software", "/category/software"], ["Markets", "/category/markets"],
  ["Guides", "/guides"], ["Articles", "/articles"], ["About", "/about"]
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!open) return;
    scrollYRef.current = window.scrollY;
    const body = document.body;
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 901px)");
    const handleDesktop = (event: MediaQueryListEvent) => { if (event.matches) setOpen(false); };
    media.addEventListener("change", handleDesktop);
    return () => media.removeEventListener("change", handleDesktop);
  }, []);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return <>
    <button ref={triggerRef} type="button" className="mobile-nav-trigger" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => open ? close(false) : setOpen(true)}><Menu size={20}/></button>
    <div className={`mobile-nav-overlay${open ? " is-open" : ""}`} aria-hidden="true" onClick={() => close()} />
    <aside ref={drawerRef} id="mobile-navigation" className={`mobile-nav-drawer${open ? " is-open" : ""}`} role="dialog" aria-modal={open ? true : undefined} aria-label="Mobile navigation" aria-hidden={!open} inert={!open}>
      <div className="mobile-nav-head"><span>Explore KitsuWire</span><button ref={closeRef} type="button" aria-label="Close navigation" onClick={() => close()}><X size={20}/></button></div>
      <nav aria-label="Primary navigation">{links.map(([label, href]) => <Link className={isActive(href) ? "is-active" : undefined} aria-current={isActive(href) ? "page" : undefined} key={href} href={href} onClick={() => close(false)}>{label}<span>→</span></Link>)}</nav>
      <div className="mobile-nav-actions"><Link href="/search" onClick={() => close(false)}><Search size={17}/> Search KitsuWire</Link><Link className="mobile-nav-subscribe" href="/#newsletter" onClick={() => close(false)}><Mail size={17}/> Subscribe</Link></div>
      <p>AI · Technology · Software · Markets</p>
    </aside>
  </>;
}
