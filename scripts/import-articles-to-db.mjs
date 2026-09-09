import { PrismaClient, ArticleStatus } from "@prisma/client";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const root = path.join(process.cwd(), "content", "articles");
const categories = ["ai", "technology", "software", "markets"];
const categoryMeta = {
  ai: { label: "AI", title: "Artificial Intelligence", description: "Models, agents, companies and the infrastructure powering the AI era." },
  technology: { label: "Technology", title: "Technology", description: "Cloud, containers, infrastructure and the systems changing how the world works." },
  software: { label: "Software", title: "Software", description: "Developer tools, DevOps, open source and the modern software stack." },
  markets: { label: "Markets", title: "Markets", description: "Investing, money and the economic forces behind technological change." },
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getFiles() {
  return categories.flatMap((category) => {
    const dir = path.join(root, category);
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter((name) => name.endsWith(".json")).map((name) => path.join(dir, name));
  });
}

async function ensureCategories() {
  for (const slug of categories) {
    const meta = categoryMeta[slug];
    await prisma.category.upsert({
      where: { slug },
      update: meta,
      create: { slug, ...meta },
    });
  }
}

async function importArticle(file) {
  const article = JSON.parse(readFileSync(file, "utf8"));
  const category = await prisma.category.findUniqueOrThrow({ where: { slug: article.category } });
  const authorName = article.author || "KitsuWire Editorial";
  const author = await prisma.author.upsert({
    where: { name: authorName },
    update: {},
    create: { name: authorName },
  });

  const tagRecords = [];
  for (const name of article.tags || []) {
    const slug = slugify(name);
    if (!slug) continue;
    tagRecords.push(await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    }));
  }

  const publishedAt = article.publishedAt ? new Date(`${article.publishedAt}T12:00:00.000Z`) : null;

  const saved = await prisma.article.upsert({
    where: { slug: article.slug },
    update: {
      title: article.title,
      excerpt: article.excerpt,
      seoTitle: article.seoTitle ?? null,
      seoDescription: article.seoDescription ?? null,
      body: article.body,
      keyTakeaways: article.keyTakeaways ?? null,
      readingTime: article.readingTime,
      tone: article.tone,
      featured: Boolean(article.featured),
      allowAds: true,
      status: ArticleStatus.PUBLISHED,
      publishedAt,
      categoryId: category.id,
      authorId: author.id,
      tags: { set: tagRecords.map(({ id }) => ({ id })) },
    },
    create: {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      seoTitle: article.seoTitle ?? null,
      seoDescription: article.seoDescription ?? null,
      body: article.body,
      keyTakeaways: article.keyTakeaways ?? null,
      readingTime: article.readingTime,
      tone: article.tone,
      featured: Boolean(article.featured),
      allowAds: true,
      status: ArticleStatus.PUBLISHED,
      publishedAt,
      categoryId: category.id,
      authorId: author.id,
      tags: { connect: tagRecords.map(({ id }) => ({ id })) },
    },
  });

  await prisma.$transaction([
    prisma.articleSection.deleteMany({ where: { articleId: saved.id } }),
    prisma.articleFaq.deleteMany({ where: { articleId: saved.id } }),
    prisma.articleSource.deleteMany({ where: { articleId: saved.id } }),
  ]);

  if (article.sections?.length) {
    await prisma.articleSection.createMany({ data: article.sections.map((section, position) => ({
      articleId: saved.id,
      heading: section.heading,
      paragraphs: section.paragraphs || [],
      bullets: section.bullets ?? undefined,
      position,
    })) });
  }
  if (article.faq?.length) {
    await prisma.articleFaq.createMany({ data: article.faq.map((item, position) => ({ articleId: saved.id, question: item.question, answer: item.answer, position })) });
  }
  if (article.sources?.length) {
    await prisma.articleSource.createMany({ data: article.sources.map((item, position) => ({ articleId: saved.id, label: item.label, url: item.url, position })) });
  }

  console.log(`Imported ${article.slug}`);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required. Copy .env.example to .env and configure PostgreSQL first.");
  await ensureCategories();
  const files = getFiles();
  for (const file of files) await importArticle(file);
  console.log(`\nImported ${files.length} articles into PostgreSQL.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
