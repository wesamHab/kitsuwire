import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KitsuWire — AI, Technology, Software & Markets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#0b0d0f", color: "#f5f7f2", fontFamily: "Arial, sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 420, height: 420, borderRadius: 999, right: -110, top: -105, background: "#c9ff42", opacity: .95 }} />
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: 999, right: 235, bottom: -90, background: "#7459ff", opacity: .55 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 58, height: 58, borderRadius: 17, background: "#c9ff42", color: "#0b0d0f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 31, fontWeight: 900 }}>K</div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1.5 }}>Kitsu<span style={{ color: "#c9ff42" }}>Wire</span></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 800, gap: 22 }}>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, letterSpacing: -4, lineHeight: 1.02 }}>Understand what moves the world.</div>
        <div style={{ display: "flex", fontSize: 27, lineHeight: 1.35, color: "#b8bdc2" }}>Clear intelligence on AI, technology, software and markets.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 18, letterSpacing: 2.2, color: "#c9ff42" }}>AI · TECHNOLOGY · SOFTWARE · MARKETS</div>
    </div>,
    size,
  );
}
