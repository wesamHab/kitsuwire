import Link from "next/link";
import { CheckCircle2, CircleX } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Newsletter Confirmation", robots: { index: false, follow: false } };

export default async function NewsletterConfirmedPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const invalid = status === "invalid";
  return <main><SiteHeader/><section className="info-page shell newsletter-result-page"><div className="newsletter-result-card">{invalid ? <CircleX size={38}/> : <CheckCircle2 size={38}/>}<span className="kicker">KITSUWIRE NEWSLETTER</span><h1>{invalid ? "This confirmation link is not valid." : "Subscription confirmed."}</h1><p>{invalid ? "The link may already have been used or may be incomplete. You can submit your email again from the homepage." : "You are now on the active KitsuWire newsletter list."}</p><Link className="button" href="/">Back to KitsuWire</Link></div></section><SiteFooter/></main>;
}
