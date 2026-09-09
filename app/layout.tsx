import type { Metadata } from "next";
import { KitsuCursor } from "@/components/KitsuCursor";
import { getFoxCursorEnabled } from "@/lib/site-settings";
import "./globals.css";
import "./brand.css";
import "./hero-polish.css";
import "./editorial.css";
import "./theme.css";
import "./reference.css";
import "./article-pro.css";
import "./utility.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kitsuwire.com"),
  title: { default: "KitsuWire — AI, Technology, Software & Markets", template: "%s | KitsuWire" },
  description: "KitsuWire makes the signals shaping AI, technology, software and markets easier to understand.",
  icons: { icon: "/kitsuwire-mark.svg", shortcut: "/kitsuwire-mark.svg", apple: "/kitsuwire-mark.svg" },
  openGraph: {
    title: "KitsuWire",
    description: "The signal behind what's next in AI, technology, software and markets.",
    url: "https://kitsuwire.com",
    siteName: "KitsuWire",
    type: "website",
  },
};

const themeScript = `(function(){try{var saved=localStorage.getItem('kitsuwire-theme');var theme=saved==='light'||saved==='dark'?saved:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const foxCursorEnabled = await getFoxCursorEnabled();
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning><script id="kitsuwire-theme-init" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body suppressHydrationWarning>{children}<KitsuCursor enabled={foxCursorEnabled} /></body>
    </html>
  );
}
