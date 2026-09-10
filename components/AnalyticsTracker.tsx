"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PRIVACY_CHANGE_EVENT, PRIVACY_STORAGE_KEY, type PrivacyPreferences } from "@/components/PrivacyConsent";

const VISITOR_COOKIE = "kw_visitor";
const SESSION_COOKIE = "kw_session";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 180;
const SESSION_MAX_AGE = 60 * 30;

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

function readCookie(name: string) {
  const prefix = `${name}=`;
  return document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith(prefix))?.slice(prefix.length) ?? null;
}

function cookieAttributes(maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}${cookieAttributes(maxAge)}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

function clearAnalyticsIds() {
  deleteCookie(VISITOR_COOKIE);
  deleteCookie(SESSION_COOKIE);
}

function ensureAnalyticsIds() {
  let visitorId = readCookie(VISITOR_COOKIE);
  let sessionId = readCookie(SESSION_COOKIE);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    setCookie(VISITOR_COOKIE, visitorId, VISITOR_MAX_AGE);
  }
  if (!sessionId) sessionId = crypto.randomUUID();
  setCookie(SESSION_COOKIE, sessionId, SESSION_MAX_AGE);
  return { visitorId: decodeURIComponent(visitorId), sessionId: decodeURIComponent(sessionId) };
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const [consentVersion, setConsentVersion] = useState(0);

  useEffect(() => {
    const handleChange = () => {
      if (!analyticsAllowed()) clearAnalyticsIds();
      lastPath.current = null;
      setConsentVersion(value => value + 1);
    };
    window.addEventListener(PRIVACY_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(PRIVACY_CHANGE_EVENT, handleChange);
  }, []);

  useEffect(() => {
    if (!analyticsAllowed() || navigator.doNotTrack === "1") clearAnalyticsIds();
  }, [consentVersion]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/_next")) return;
    if (navigator.doNotTrack === "1" || !analyticsAllowed()) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const { visitorId, sessionId } = ensureAnalyticsIds();
    const payload = JSON.stringify({ path: pathname, referrerHost: referrerHost(), visitorId, sessionId });
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/view", blob);
    } else {
      fetch("/api/analytics/view", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [pathname, consentVersion]);

  return null;
}
