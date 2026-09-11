import type { Metadata } from "next";

export const SITE_URL = "https://kitsuwire.com";
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/opengraph-image`;
export const SITE_NAME = "KitsuWire";

const DEFAULT_KEYWORDS = [
  "KitsuWire",
  "AI news",
  "technology news",
  "software",
  "cloud computing",
  "DevOps",
  "markets",
  "technology explainers",
];

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
};

export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = new URL(path || "/", SITE_URL).toString();
  const socialTitle = title.includes("KitsuWire") ? title : `${title} | KitsuWire`;
  return {
    title,
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [{ url: DEFAULT_SOCIAL_IMAGE, width: 1200, height: 630, alt: "KitsuWire — AI, Technology, Software & Markets" }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
  };
}
