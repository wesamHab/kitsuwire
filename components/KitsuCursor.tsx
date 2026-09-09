"use client";

import { useEffect, useRef, useState } from "react";
import { KitsuFox } from "./KitsuFox";

const STORAGE_KEY = "kitsuwire-fox-cursor";
const EVENT_NAME = "kitsuwire:fox-cursor";

export function KitsuCursor({ enabled = true }: { enabled?: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const [visitorEnabled, setVisitorEnabled] = useState(enabled);
  const [interactive, setInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisitorEnabled(false);
      return;
    }
    try { setVisitorEnabled(localStorage.getItem(STORAGE_KEY) !== "off"); }
    catch { setVisitorEnabled(true); }
    const onPreference = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled: boolean }>).detail;
      if (typeof detail?.enabled === "boolean") setVisitorEnabled(detail.enabled);
    };
    window.addEventListener(EVENT_NAME, onPreference);
    return () => window.removeEventListener(EVENT_NAME, onPreference);
  }, [enabled]);

  useEffect(() => {
    if (!visitorEnabled || !window.matchMedia("(pointer: fine)").matches) {
      delete document.documentElement.dataset.kitsuCursor;
      setVisible(false);
      return;
    }
    let frame = 0;
    document.documentElement.dataset.kitsuCursor = "enabled";

    const move = (event: MouseEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
      setVisible(true);
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      setInteractive(Boolean(element?.closest("a, button, input, textarea, select, [role='button']")));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);
    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.28;
      current.current.y += (target.current.y - current.current.y) * 0.28;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    frame = requestAnimationFrame(animate);

    return () => {
      delete document.documentElement.dataset.kitsuCursor;
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
    };
  }, [visitorEnabled]);

  if (!enabled) return null;
  return <div ref={cursorRef} className={`kitsu-cursor${visible && visitorEnabled ? " is-visible" : ""}${interactive ? " is-interactive" : ""}${pressed ? " is-pressed" : ""}`} aria-hidden="true"><KitsuFox mood={interactive ? "happy" : "calm"} /></div>;
}
