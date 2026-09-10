import { ImageResponse } from "next/og";
import { getArticle } from "@/lib/articles";

export const alt = "KitsuWire article preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const title = article?.title ?? "KitsuWire";
  const category = article?.categoryLabel ?? "KitsuWire";

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#0b0d0f", color: "#f5f7f2", fontFamily: "Arial, sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 360, height: 360, borderRadius: 999, right: -80, top: -90, background: "#c9ff42", opacity: .92 }} />
      <div style={{ position: "absolute", width: 170, height: 170, borderRadius: 999, right: 210, bottom: -65, background: "#7459ff", opacity: .55 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#c9ff42", color: "#0b0d0f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900 }}>K</div>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 800, letterSpacing: -1.5 }}>Kitsu<span style={{ color: "#c9ff42" }}>Wire</span></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: 930, gap: 22 }}>
        <div style={{ display: "flex", fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: "#c9ff42", fontWeight: 700 }}>{category}</div>
        <div style={{ display: "flex", fontSize: title.length > 72 ? 52 : 62, fontWeight: 800, letterSpacing: -3.2, lineHeight: 1.04 }}>{title}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18, color: "#aeb5ba" }}>
        <div style={{ display: "flex" }}>Clear intelligence for a fast-moving world.</div>
        <div style={{ display: "flex", color: "#c9ff42", fontWeight: 700 }}>kitsuwire.com</div>
      </div>
    </div>,
    size,
  );
}
