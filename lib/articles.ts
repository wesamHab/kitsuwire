import "server-only";
import { cache } from "react";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const categories = ["ai", "technology", "software", "markets"] as const;
export type Category = (typeof categories)[number];
export type ArticleTone = "violet" | "blue" | "orange" | "green";

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ArticleFaq = {
  question: string;
  answer: string;
};

export type ArticleSource = {
  label: string;
  url: string;
};

export type Article = {
  slug: string;
  category: Category;
  categoryLabel: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;
  tone: ArticleTone;
  featured?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  author?: string;
  keyTakeaways?: string[];
  body: string[];
  sections?: ArticleSection[];
  faq?: ArticleFaq[];
  sources?: ArticleSource[];
};

export const categoryMeta: Record<Category, { title: string; description: string }> = {
  ai: { title: "Artificial Intelligence", description: "Models, agents, companies and the infrastructure powering the AI era." },
  technology: { title: "Technology", description: "Cloud, containers, infrastructure and the systems changing how the world works." },
  software: { title: "Software", description: "Developer tools, DevOps, open source and the modern software stack." },
  markets: { title: "Markets", description: "Investing, money and the economic forces behind technological change." },
};

const contentRoot = path.join(process.cwd(), "content", "articles");

function isCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

function validateArticle(input: unknown, source: string): Article {
  if (!input || typeof input !== "object") throw new Error(`Invalid article JSON: ${source}`);
  const value = input as Record<string, unknown>;
  const required = ["slug", "category", "categoryLabel", "title", "excerpt", "publishedAt", "readingTime", "tone", "body"];
  for (const key of required) if (value[key] === undefined) throw new Error(`Missing '${key}' in ${source}`);
  if (!isCategory(String(value.category))) throw new Error(`Invalid category in ${source}`);
  if (!Array.isArray(value.body)) throw new Error(`Article body must be an array in ${source}`);
  if (value.sections !== undefined && !Array.isArray(value.sections)) throw new Error(`Article sections must be an array in ${source}`);
  if (value.faq !== undefined && !Array.isArray(value.faq)) throw new Error(`Article faq must be an array in ${source}`);
  if (value.sources !== undefined && !Array.isArray(value.sources)) throw new Error(`Article sources must be an array in ${source}`);
  return value as Article;
}

function articleFiles(): string[] {
  if (!existsSync(contentRoot)) return [];
  return categories.flatMap((category) => {
    const dir = path.join(contentRoot, category);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(dir, file));
  });
}

export const getAllArticles = cache((): Article[] =>
  articleFiles()
    .map((file) => validateArticle(JSON.parse(readFileSync(file, "utf8")), file))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
);

export const getArticle = cache((slug: string): Article | undefined =>
  getAllArticles().find((article) => article.slug === slug)
);

export const getArticlesByCategory = cache((category: Category): Article[] =>
  getAllArticles().filter((article) => article.category === category)
);

export const getFeaturedArticle = cache((): Article | undefined =>
  getAllArticles().find((article) => article.featured) ?? getAllArticles()[0]
);
