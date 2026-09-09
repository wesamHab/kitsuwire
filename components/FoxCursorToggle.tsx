"use client";

import { useEffect, useState } from "react";
import { KitsuFox } from "./KitsuFox";

const STORAGE_KEY = "kitsuwire-fox-cursor";
const EVENT_NAME = "kitsuwire:fox-cursor";

export function FoxCursorToggle({ available = true }: { available?: boolean }) {
  const [enabled, setEnabled] = useState(available);

  useEffect(() => {
    if (!available) {
      setEnabled(false);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setEnabled(saved !== "off");
    } catch {
      setEnabled(true);
    }
  }, [available]);

  function toggle() {
    if (!available) return;
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem(STORAGE_KEY, next ? "on" : "off"); } catch {}
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { enabled: next } }));
  }

  return (
    <button
      type="button"
      className={`fox-cursor-toggle${enabled ? " is-awake" : " is-sleeping"}`}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn off the fox cursor" : "Turn on the fox cursor"}
      title={enabled ? "Fox cursor is awake — click to turn it off" : "Fox cursor is sleeping — click to wake it up"}
      disabled={!available}
    >
      <span className="fox-cursor-toggle-icon"><KitsuFox mood={enabled ? "happy" : "sleeping"} /></span>
      <span className="fox-cursor-toggle-z" aria-hidden="true">zZ</span>
    </button>
  );
}
