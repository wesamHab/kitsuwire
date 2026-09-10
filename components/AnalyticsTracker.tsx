"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PRIVACY_CHANGE_EVENT, PRIVACY_STORAGE_KEY, type PrivacyPreferences } from "@/components/PrivacyConsent";

function referrerHost() {
  if (!document.referrer) return null;
  try {
    const url = new URL(document.referrer);
    if (url.host === window.location.host) return null;
    return url.host.slice(0, 180);
  } catch {
    return null;
  }
}

function analyticsAllowed() {
  try {
    const raw = window.localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<PrivacyPreferences>;
    return parsed.version === 1 && parsed.analytics === true;
  } catch {
    return false;
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const [consentVersion, setConsentVersion] = useState(0);

  useEffect(() => {
    const handleChange = () => setConsentVersion(value => value + 1);
    window.addEventListener(PRIVACY_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, handleChange);
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/_next")) return;
    if (navigator.doNotTrack === "1" || !analyticsAllowed()) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const payload = JSON.stringify({ path: pathname, referrerHost: referrerHost() });
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/view", blob);
    } else {
      fetch("/api/analytics/view", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [pathname, consentVersion]);

  return null;
}
