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

export function PrivacyConsent({ googleAdsManaged = false }: { googleAdsManaged?: boolean }) {
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
      setAdvertising(googleAdsManaged ? false : current.advertising);
      setHasDecision(true);
    } else if (!googleAdsManaged) {
      // If Google CMP manages advertising, avoid stacking two consent dialogs.
      // First-party analytics stays off until the visitor explicitly enables it
      // from Privacy settings in the footer.
      setOpen(true);
    }
    setMounted(true);

    const show = () => {
      const saved = readPreferences();
      if (saved) {
        setAnalytics(saved.analytics);
        setAdvertising(googleAdsManaged ? false : saved.advertising);
      }
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(PRIVACY_OPEN_EVENT, show);
    return () => window.removeEventListener(PRIVACY_OPEN_EVENT, show);
  }, [googleAdsManaged]);

  if (!mounted || !open) return null;

  function save(nextAnalytics: boolean, nextAdvertising: boolean) {
    const preferences: PrivacyPreferences = {
      version: 1,
      analytics: nextAnalytics,
      advertising: googleAdsManaged ? false : nextAdvertising,
      decidedAt: new Date().toISOString(),
    };
    setAnalytics(nextAnalytics);
    setAdvertising(preferences.advertising);
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
          {hasDecision || googleAdsManaged ? <button type="button" className="privacy-close" onClick={() => setOpen(false)} aria-label="Close privacy settings"><X size={18}/></button> : null}
        </div>
        <p>{googleAdsManaged ? "KitsuWire uses this panel for optional first-party analytics. Advertising consent is managed separately by Google’s certified consent platform." : "KitsuWire always uses the storage needed for core preferences and secure administration. Optional analytics and advertising stay off until you choose otherwise."}</p>
        {details ? <div className="privacy-options">
          <div><span><strong>Necessary & preferences</strong><small>Always active · security, theme, fox cursor and your privacy choice.</small></span><span className="privacy-required">Required</span></div>
          <label><span><strong>Analytics</strong><small>First-party visitor and session IDs measure page views, sessions and returning visits only after consent. No account identity, IP address or browser fingerprint is stored in application analytics.</small></span><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)}/></label>
          {googleAdsManaged ? <div><span><strong>Advertising</strong><small>Google AdSense advertising consent is handled by Google’s certified CMP, including the required choices for visitors in the EEA, UK and Switzerland.</small></span><span className="privacy-required">Google CMP</span></div> : <label><span><strong>Advertising</strong><small>Reserved for consent-requiring advertising such as Google AdSense. No ad technology is loaded by this setting until KitsuWire enables it.</small></span><input type="checkbox" checked={advertising} onChange={event => setAdvertising(event.target.checked)}/></label>}
        </div> : null}
        <div className="privacy-consent-actions">
          <button type="button" className="privacy-necessary" onClick={() => save(false, false)}>Necessary only</button>
          {details ? <button type="button" className="privacy-save" onClick={() => save(analytics, advertising)}>Save choices</button> : <button type="button" className="privacy-settings" onClick={() => setDetails(true)}>Customize</button>}
          {!googleAdsManaged ? <button type="button" className="privacy-accept" onClick={() => save(true, true)}>Accept all</button> : <button type="button" className="privacy-accept" onClick={() => save(true, false)}>Allow analytics</button>}
        </div>
        <p className="privacy-consent-meta">You can change KitsuWire analytics preferences anytime under “Privacy settings” in the footer. Google advertising choices are managed through Google&apos;s consent message. <Link href="/privacy">Privacy policy</Link></p>
      </div>
    </div>
  </div>;
}
