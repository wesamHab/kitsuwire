"use client";

import { useEffect, useRef, useState } from "react";
import { KitsuFox } from "./KitsuFox";

export function KitsuCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const [interactive, setInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;

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
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`kitsu-cursor${visible ? " is-visible" : ""}${interactive ? " is-interactive" : ""}${pressed ? " is-pressed" : ""}`}
      aria-hidden="true"
    >
      <KitsuFox mood={interactive ? "happy" : "calm"} />
    </div>
  );
}
