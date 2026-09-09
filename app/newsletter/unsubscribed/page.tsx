import Link from "next/link";
import { CheckCircle2, CircleX } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Newsletter Unsubscribe", robots: { index: false, follow: false } };

export default async function NewsletterUnsubscribedPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const invalid = status === "invalid";
  return <main><SiteHeader/><section className="info-page shell newsletter-result-page"><div className="newsletter-result-card">{invalid ? <CircleX size={38}/> : <CheckCircle2 size={38}/>}<span className="kicker">KITSUWIRE NEWSLETTER</span><h1>{invalid ? "This unsubscribe link is not valid." : "You have been unsubscribed."}</h1><p>{invalid ? "The link may be incomplete or no longer valid." : "This address will no longer receive KitsuWire newsletter emails. You can subscribe again at any time."}</p><Link className="button" href="/">Back to KitsuWire</Link></div></section><SiteFooter/></main>;
}
