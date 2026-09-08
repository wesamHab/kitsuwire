import type { Metadata } from "next";
import "./globals.css";
import "./brand.css";
import "./hero-polish.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kitsuwire.com"),
  title: {
    default: "KitsuWire — AI, Technology, Software & Markets",
    template: "%s | KitsuWire",
  },
  description: "KitsuWire makes the signals shaping AI, technology, software and markets easier to understand.",
  icons: {
    icon: "/kitsuwire-mark.svg",
    shortcut: "/kitsuwire-mark.svg",
    apple: "/kitsuwire-mark.svg",
  },
  openGraph: {
    title: "KitsuWire",
    description: "The signal behind what's next in AI, technology, software and markets.",
    url: "https://kitsuwire.com",
    siteName: "KitsuWire",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
