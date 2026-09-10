import type { Metadata } from "next";

export const SITE_URL = "https://kitsuwire.com";
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/opengraph-image`;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
};

export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = new URL(path || "/", SITE_URL).toString();
  const socialTitle = `${title} | KitsuWire`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: "KitsuWire",
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
