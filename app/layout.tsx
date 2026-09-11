import type { Metadata } from "next";
import Script from "next/script";
import { AdSenseLoader } from "@/components/AdSenseLoader";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { KitsuCursor } from "@/components/KitsuCursor";
import { PrivacyConsent } from "@/components/PrivacyConsent";
import { getFoxCursorEnabled } from "@/lib/site-settings";
import "./globals.css";
import "./brand.css";
import "./hero-polish.css";
import "./editorial.css";
import "./theme.css";
import "./reference.css";
import "./article-pro.css";
import "./utility.css";
import "./admin.css";
import "./media.css";
import "./seo-admin.css";
import "./taxonomy-admin.css";
import "./system-admin.css";
import "./newsletter-admin.css";
import "./privacy-consent.css";
import "./mobile-nav-fix.css";
import "./mobile-qa.css";

export const dynamic = "force-dynamic";

const SITE = "https://kitsuwire.com";
const SOCIAL_IMAGE = `${SITE}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "KitsuWire — Tech News. Clearer.", template: "%s | KitsuWire" },
  description: "Clear, in-depth insights on AI, technology, software, and markets.",
  openGraph: { type: "website", siteName: "KitsuWire", url: SITE, title: "KitsuWire — Tech News. Clearer.", description: "Clear, in-depth insights on AI, technology, software, and markets.", images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: "KitsuWire" }] },
  twitter: { card: "summary_large_image", title: "KitsuWire — Tech News. Clearer.", description: "Clear, in-depth insights on AI, technology, software, and markets.", images: [SOCIAL_IMAGE] },
};

const themeScript = `(function(){try{var s=localStorage.getItem('kitsuwire_theme');var t=s==='dark'||s==='light'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}})();`;
const ADSENSE_CLIENT_RE = /^ca-pub-\d{10,20}$/;

export default async function RootLayout({children}:{children:React.ReactNode}){
  const foxCursorEnabled=await getFoxCursorEnabled();
  const rawAdsenseClient=process.env.ADSENSE_CLIENT?.trim()||"";
  const adsenseClient=ADSENSE_CLIENT_RE.test(rawAdsenseClient)?rawAdsenseClient:"";
  const websiteJsonLd={"@context":"https://schema.org","@type":"WebSite",name:"KitsuWire",url:SITE,potentialAction:{"@type":"SearchAction",target:`${SITE}/search?q={search_term_string}`,"query-input":"required name=search_term_string"}};
  const organizationJsonLd={"@context":"https://schema.org","@type":"Organization",name:"KitsuWire",url:SITE,logo:`${SITE}/opengraph-image`};
  return <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
    <head>
      {adsenseClient?<meta name="google-adsense-account" content={adsenseClient}/>:null}
    </head>
    <body>
      <Script id="theme-init" strategy="beforeInteractive">{themeScript}</Script>
      <Script id="website-jsonld" type="application/ld+json" strategy="afterInteractive">{JSON.stringify(websiteJsonLd)}</Script>
      <Script id="organization-jsonld" type="application/ld+json" strategy="afterInteractive">{JSON.stringify(organizationJsonLd)}</Script>
      <AdSenseLoader clientId={adsenseClient}/>
      <KitsuCursor enabled={foxCursorEnabled}/>
      <AnalyticsTracker/>
      {children}
      <PrivacyConsent/>
    </body>
  </html>;
}
