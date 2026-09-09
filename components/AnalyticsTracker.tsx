"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/_next")) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    if (navigator.doNotTrack === "1") return;

    const payload = JSON.stringify({ path: pathname, referrerHost: referrerHost() });
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/view", blob);
    } else {
      fetch("/api/analytics/view", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
