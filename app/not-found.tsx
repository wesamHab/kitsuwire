import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound(){return <main><SiteHeader/><section className="not-found shell"><span className="kicker">404 / SIGNAL LOST</span><h1>We lost the wire.</h1><p>The page you are looking for does not exist or has moved.</p><Link className="primary" href="/"><ArrowLeft size={17}/> Back to KitsuWire</Link></section></main>}
