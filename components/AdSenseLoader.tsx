"use client";

import Script from "next/script";

export function AdSenseLoader({ clientId }: { clientId?: string | null }) {
  const validClient = typeof clientId === "string" && /^ca-pub-\d{10,20}$/.test(clientId.trim()) ? clientId.trim() : null;

  // The AdSense script must be available so Google's certified CMP can render
  // and manage EEA/UK/CH advertising consent. KitsuWire's own privacy control
  // remains responsible only for first-party analytics when AdSense is active.
  if (!validClient) return null;

  return <Script
    id="kitsuwire-adsense"
    strategy="afterInteractive"
    async
    crossOrigin="anonymous"
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(validClient)}`}
  />;
}
