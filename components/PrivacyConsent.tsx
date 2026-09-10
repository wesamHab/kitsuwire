"use client";

import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

export type PrivacyPreferences = {
  version: 1;
  analytics: boolean;
  advertising: boolean;
  decidedAt: string;
};

export const PRIVACY_STORAGE_KEY = "kitsuwire-privacy-v1";
export const PRIVACY_CHANGE_EVENT = "kitsuwire:privacy-change";
export const PRIVACY_OPEN_EVENT = "kitsuwire:privacy-open";

function readPreferences(): PrivacyPreferences | null {
  try {
    const raw = window.localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PrivacyPreferences>;
    if (parsed.version !== 1 || typeof parsed.analytics !== "boolean" || typeof parsed.advertising !== "boolean") return null;
    return { version: 1, analytics: parsed.analytics, advertising: parsed.advertising, decidedAt: String(parsed.decidedAt ?? "") };
  } catch {
    return null;
  }
}

function persist(preferences: PrivacyPreferences) {
  window.localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent(PRIVACY_CHANGE_EVENT, { detail: preferences }));
}

export function PrivacyConsent() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const [hasDecision, setHasDecision] = useState(false);

  useEffect(() => {
    const current = readPreferences();
    if (current) {
      setAnalytics(current.analytics);
      setAdvertising(current.advertising);
      setHasDecision(true);
    } else {
      setOpen(true);
    }
    setMounted(true);

    const show = () => {
      const saved = readPreferences();
      if (saved) {
        setAnalytics(saved.analytics);
        setAdvertising(saved.advertising);
      }
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(PRIVACY_OPEN_EVENT, show);
    return () => window.removeEventListener(PRIVACY_OPEN_EVENT, show);
  }, []);

  if (!mounted || !open) return null;

  function save(nextAnalytics: boolean, nextAdvertising: boolean) {
    const preferences: PrivacyPreferences = {
      version: 1,
      analytics: nextAnalytics,
      advertising: nextAdvertising,
      decidedAt: new Date().toISOString(),
    };
    setAnalytics(nextAnalytics);
    setAdvertising(nextAdvertising);
    setHasDecision(true);
    persist(preferences);
    setOpen(false);
  }

  return <div className="privacy-consent" role="dialog" aria-modal="true" aria-labelledby="privacy-consent-title">
    <div className="privacy-consent-card">
      <div className="privacy-consent-icon"><ShieldCheck size={20}/></div>
      <div className="privacy-consent-copy">
        <div className="privacy-consent-title-row">
          <h2 id="privacy-consent-title">Your privacy, your choice.</h2>
          {hasDecision ? <button type="button" className="privacy-close" onClick={() => setOpen(false)} aria-label="Close privacy settings"><X size={18}/></button> : null}
        </div>
        <p>KitsuWire always uses the storage needed for core preferences and secure administration. Optional analytics and future advertising stay off until you choose otherwise.</p>
        {details ? <div className="privacy-options">
          <div><span><strong>Necessary & preferences</strong><small>Always active · security, theme, fox cursor and your privacy choice.</small></span><span className="privacy-required">Required</span></div>
          <label><span><strong>Analytics</strong><small>Anonymous first-party page-view measurement. No tracking cookie or persistent visitor ID.</small></span><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)}/></label>
          <label><span><strong>Advertising</strong><small>Reserved for consent-requiring advertising such as Google AdSense. No ad technology is loaded by this setting until KitsuWire enables it.</small></span><input type="checkbox" checked={advertising} onChange={event => setAdvertising(event.target.checked)}/></label>
        </div> : null}
        <div className="privacy-consent-actions">
          <button type="button" className="privacy-necessary" onClick={() => save(false, false)}>Necessary only</button>
          {details ? <button type="button" className="privacy-save" onClick={() => save(analytics, advertising)}>Save choices</button> : <button type="button" className="privacy-settings" onClick={() => setDetails(true)}>Customize</button>}
          <button type="button" className="privacy-accept" onClick={() => save(true, true)}>Accept all</button>
        </div>
        <p className="privacy-consent-meta">You can change this anytime under “Privacy settings” in the footer. <Link href="/privacy">Privacy policy</Link></p>
      </div>
    </div>
  </div>;
}
