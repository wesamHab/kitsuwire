"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { PRIVACY_CHANGE_EVENT, PRIVACY_STORAGE_KEY, type PrivacyPreferences } from "@/components/PrivacyConsent";

function advertisingAllowed() {
  try {
    const raw = window.localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<PrivacyPreferences>;
    return parsed.version === 1 && parsed.advertising === true;
  } catch {
    return false;
  }
}

export function AdSenseLoader({ clientId }: { clientId?: string | null }) {
  const validClient = typeof clientId === "string" && /^ca-pub-\d{10,20}$/.test(clientId.trim()) ? clientId.trim() : null;
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(advertisingAllowed());
    const handleChange = () => setAllowed(advertisingAllowed());
    window.addEventListener(PRIVACY_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, handleChange);
  }, []);

  if (!validClient || !allowed) return null;

  return <Script
    id="kitsuwire-adsense"
    strategy="afterInteractive"
    async
    crossOrigin="anonymous"
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(validClient)}`}
  />;
}
