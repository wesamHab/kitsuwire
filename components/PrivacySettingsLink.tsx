"use client";

import { PRIVACY_OPEN_EVENT } from "./PrivacyConsent";

export function PrivacySettingsLink() {
  return <button type="button" className="footer-privacy-button" onClick={() => window.dispatchEvent(new Event(PRIVACY_OPEN_EVENT))}>Privacy settings</button>;
}
