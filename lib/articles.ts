import "server-only";
import { cache } from "react";
import { ArticleStatus, type Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const categories = ["ai", "technology", "software", "markets"] as const;
export type Category = (typeof categories)[number];
export type ArticleTone = "violet" | "blue" | "orange" | "green";

export type ArticleSection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type ArticleFaq = { question: string; answer: string };
export type ArticleSource = { label: string; url: string };
export type ArticleImage = { url: string; altText?: string; width?: number; height?: number };

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
  featuredImage?: ArticleImage;
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

const articleInclude = {
  category: true,
  author: true,
  featuredImage: true,
  tags: true,
  sections: { orderBy: { position: "asc" as const } },
  faq: { orderBy: { position: "asc" as const } },
  sources: { orderBy: { position: "asc" as const } },
} satisfies Prisma.ArticleInclude;

type DbArticle = Prisma.ArticleGetPayload<{ include: typeof articleInclude }>;

function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isCategory(value: string): value is Category { return categories.includes(value as Category); }

function toArticle(record: DbArticle): Article {
  if (!isCategory(record.category.slug)) throw new Error(`Unknown article category '${record.category.slug}' for ${record.slug}`);
  return {
    slug: record.slug,
    category: record.category.slug,
    categoryLabel: record.category.label,
    title: record.title,
    excerpt: record.excerpt,
    publishedAt: (record.publishedAt ?? record.scheduledAt ?? record.createdAt).toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    readingTime: record.readingTime,
    tone: record.tone as ArticleTone,
    featured: record.featured,
    featuredImage: record.featuredImage ? {
      url: record.featuredImage.url,
      altText: record.featuredImage.altText ?? undefined,
      width: record.featuredImage.width ?? undefined,
      height: record.featuredImage.height ?? undefined,
    } : undefined,
    tags: record.tags.map((tag) => tag.name),
    seoTitle: record.seoTitle ?? undefined,
    seoDescription: record.seoDescription ?? undefined,
    author: record.author?.name ?? undefined,
    keyTakeaways: asStringArray(record.keyTakeaways),
    body: asStringArray(record.body),
    sections: record.sections.map((section) => ({ heading: section.heading, paragraphs: asStringArray(section.paragraphs), bullets: asStringArray(section.bullets) })),
    faq: record.faq.map((item) => ({ question: item.question, answer: item.answer })),
    sources: record.sources.map((item) => ({ label: item.label, url: item.url })),
  };
}

function publicWhere(now = new Date()): Prisma.ArticleWhereInput {
  return {
    OR: [
      { status: ArticleStatus.PUBLISHED, publishedAt: { lte: now } },
      { status: ArticleStatus.SCHEDULED, scheduledAt: { lte: now } },
    ],
  };
}

export const getAllArticles = cache(async (): Promise<Article[]> => {
  const records = await db.article.findMany({ where: publicWhere(), include: articleInclude, orderBy: [{ publishedAt: "desc" }, { scheduledAt: "desc" }] });
  return records.map(toArticle).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
});

export const getArticle = cache(async (slug: string): Promise<Article | undefined> => {
  const record = await db.article.findFirst({ where: { AND: [publicWhere(), { slug }] }, include: articleInclude });
  return record ? toArticle(record) : undefined;
});

export const getArticlesByCategory = cache(async (category: Category): Promise<Article[]> => {
  const records = await db.article.findMany({ where: { AND: [publicWhere(), { category: { slug: category } }] }, include: articleInclude });
  return records.map(toArticle).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
});

export const getFeaturedArticle = cache(async (): Promise<Article | undefined> => {
  const all = await getAllArticles();
  return all.find(article => article.featureed) ?? all[0];
});

function normalizeTag(tag: string) { return tag.trim().toLowerCase(); }

export async function getRelatedArticles(article: Article, limit = 4): Promise<Article[]> {
  const sourceTags = new Set((article.tags ?? []).map(normalizeTag));
  const all = await getAllArticles();
  return all.filter(candidate => candidate.slug !== article.slug).map(candidate => {
    const sharedTags = (candidate.tags ?? []).map(normalizeTag).filter(tag => sourceTags.has(tag)).length;
    const sameCategory = candidate.category === article.category ? 2 : 0;
    const featuredBonus = candidate.featured ? 0.25 : 0;
    return { candidate, score: sharedTags * 3 + sameCategory + featuredBonus };
  }).filter(({ score }) => score > 0).sort((a,b) => b.score - a.score || b.candidate.publishedAt.localeCompare(a.candidate.publishedAt)).slice(0, limit).map(({ candidate }) => candidate);
}
