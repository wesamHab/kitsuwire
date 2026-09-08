import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { KitsuFoxExplorer } from "@/components/KitsuFox";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="not-found shell">
        <div className="not-found-copy">
          <span className="kicker">404 / SIGNAL LOST</span>
          <div className="not-found-code">404</div>
          <h1>Oops. We lost the wire.</h1>
          <p>Looks like this page went on an adventure. Our fox is already looking for the signal.</p>
          <Link className="primary" href="/"><ArrowLeft size={17} /> Back to KitsuWire</Link>
        </div>
        <div className="not-found-fox" aria-hidden="true">
          <span className="fox-signal fox-signal-one" />
          <span className="fox-signal fox-signal-two" />
          <KitsuFoxExplorer />
          <span className="not-found-caption">CURIOSITY FINDS A NEW PATH.</span>
        </div>
      </section>
    </main>
  );
}
