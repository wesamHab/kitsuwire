import type { Metadata } from "next";
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

const SITE = "https://kitsuwire.com";
const SOCIAL_IMAGE = `${SITE}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  applicationName: "KitsuWire",
  title: { default: "KitsuWire — AI, Technology, Software & Markets", template: "%s | KitsuWire" },
  description: "KitsuWire makes the signals shaping AI, technology, software and markets easier to understand.",
  keywords: ["AI", "artificial intelligence", "technology", "software", "cloud", "DevOps", "markets", "finance"],
  authors: [{ name: "KitsuWire Editorial", url: SITE }],
  creator: "KitsuWire",
  publisher: "KitsuWire",
  alternates: { canonical: SITE },
  icons: { icon: "/kitsuwire-mark.svg", shortcut: "/kitsuwire-mark.svg", apple: "/kitsuwire-mark.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: "KitsuWire — AI, Technology, Software & Markets",
    description: "The signal behind what's next in AI, technology, software and markets.",
    url: SITE,
    siteName: "KitsuWire",
    locale: "en_US",
    type: "website",
    images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: "KitsuWire — AI, Technology, Software & Markets" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KitsuWire — AI, Technology, Software & Markets",
    description: "Clear intelligence on AI, technology, software and markets.",
    images: [SOCIAL_IMAGE],
  },
};

const themeScript = `(function(){try{var saved=localStorage.getItem('kitsuwire-theme');var theme=saved==='light'||saved==='dark'?saved:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;}catch(e){document.documentElement.dataset.theme='light';}})();`;

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KitsuWire",
  url: SITE,
  description: "Clear intelligence on AI, technology, software and markets.",
  inLanguage: "en",
  publisher: { "@type": "Organization", name: "KitsuWire", url: SITE },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KitsuWire",
  url: SITE,
  logo: `${SITE}/kitsuwire-mark.svg`,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const foxCursorEnabled = await getFoxCursorEnabled();
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script id="kitsuwire-theme-init" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      </head>
      <body suppressHydrationWarning>{children}<PrivacyConsent/><AnalyticsTracker/><KitsuCursor enabled={foxCursorEnabled} /></body>
    </html>
  );
}
