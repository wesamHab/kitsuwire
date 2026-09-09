"use server";

import { ArticleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const validStatuses = new Set(Object.values(ArticleStatus));

function text(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function lines(value: string) { return value.split(/\r?\n/).map(item => item.trim()).filter(Boolean); }
function parseDate(value: string, offsetRaw: string) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, m, d, h, min] = match;
  const offset = Number(offsetRaw);
  if (!Number.isFinite(offset)) return null;
  const utcMs = Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min)) + offset * 60_000;
  const date = new Date(utcMs);
  return Number.isNaN(date.getTime()) ? null : date;
}
function parseJson<T>(value: string, fallback: T): T { try { return JSON.parse(value) as T; } catch { return fallback; } }

type SectionInput = { heading?: string; paragraphs?: string; bullets?: string };
type FaqInput = { question?: string; answer?: string };
type SourceInput = { label?: string; url?: string };

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

async function resolveTags(raw: string) {
  const names = raw.split(",").map(item => item.trim()).filter(Boolean);
  const tags = [];
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    tags.push(await db.tag.upsert({ where: { slug }, update: { name }, create: { name, slug } }));
  }
  return tags;
}

async function resolveFeaturedImageId(raw: string) {
  if (!raw) return null;
  const media = await db.media.findFirst({ where: { id: raw, kind: "IMAGE" }, select: { id: true } });
  return media?.id ?? null;
}

function structured(formData: FormData) {
  const sections = parseJson<SectionInput[]>(text(formData, "sectionsJson"), []).filter(item => item.heading?.trim()).map((item, position) => ({ heading: item.heading!.trim(), paragraphs: lines(item.paragraphs ?? ""), bullets: lines(item.bullets ?? ""), position }));
  const faq = parseJson<FaqInput[]>(text(formData, "faqJson"), []).filter(item => item.question?.trim() && item.answer?.trim()).map((item, position) => ({ question: item.question!.trim(), answer: item.answer!.trim(), position }));
  const sources = parseJson<SourceInput[]>(text(formData, "sourcesJson"), []).filter(item => item.label?.trim() && item.url?.trim()).map((item, position) => ({ label: item.label!.trim(), url: item.url!.trim(), position }));
  return { sections, faq, sources };
}

export async function createArticleAction(formData: FormData) {
  const session = await requireAdmin();
  const title = text(formData, "title");
  const slug = slugify(text(formData, "slug") || title);
  const categoryId = text(formData, "categoryId");
  const statusRaw = text(formData, "status");
  const status = validStatuses.has(statusRaw as ArticleStatus) ? statusRaw as ArticleStatus : ArticleStatus.DRAFT;
  if (!title || !slug || !categoryId) redirect("/admin/articles/new?error=missing");
  if (await db.article.findUnique({ where: { slug } })) redirect("/admin/articles/new?error=slug");

  const author = await db.author.upsert({ where: { name: session.name ?? "KitsuWire Editorial" }, update: {}, create: { name: session.name ?? "KitsuWire Editorial" } });
  const tags = await resolveTags(text(formData, "tags"));
  const featuredImageId = await resolveFeaturedImageId(text(formData, "featuredImageId"));
  const { sections, faq, sources } = structured(formData);
  const now = new Date();
  const scheduledAt = status === ArticleStatus.SCHEDULED ? parseDate(text(formData, "scheduledAt"), text(formData, "timezoneOffset")) : null;
  if (status === ArticleStatus.SCHEDULED && !scheduledAt) redirect("/admin/articles/new?error=schedule");

  const article = await db.article.create({ data: {
    title, slug, excerpt: text(formData, "excerpt") || "Draft article — excerpt pending.", seoTitle: text(formData, "seoTitle") || null, seoDescription: text(formData, "seoDescription") || null,
    body: lines(text(formData, "body")), keyTakeaways: lines(text(formData, "keyTakeaways")), readingTime: text(formData, "readingTime") || "5 min", tone: text(formData, "tone") || "green", status,
    featured: formData.get("featured") === "on", allowAds: formData.get("allowAds") === "on", publishedAt: status === ArticleStatus.PUBLISHED ? now : null, scheduledAt,
    categoryId, authorId: author.id, featuredImageId, tags: { connect: tags.map(tag => ({ id: tag.id })) },
    sections: { create: sections }, faq: { create: faq }, sources: { create: sources },
  }});
  await db.articleRevision.create({ data: { articleId: article.id, note: "Created in admin", snapshot: { title, slug, status, scheduledAt, featuredImageId } } });
  revalidatePath("/admin"); revalidatePath("/admin/articles"); revalidatePath("/", "layout");
  redirect(`/admin/articles/${article.id}?saved=1`);
}

export async function updateArticleAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const current = await db.article.findUnique({ where: { id } });
  if (!current) redirect("/admin/articles");
  const title = text(formData, "title");
  const slug = slugify(text(formData, "slug") || title);
  const statusRaw = text(formData, "status");
  const status = validStatuses.has(statusRaw as ArticleStatus) ? statusRaw as ArticleStatus : current.status;
  const tags = await resolveTags(text(formData, "tags"));
  const featuredImageId = await resolveFeaturedImageId(text(formData, "featuredImageId"));
  const { sections, faq, sources } = structured(formData);
  const scheduledAt = status === ArticleStatus.SCHEDULED ? parseDate(text(formData, "scheduledAt"), text(formData, "timezoneOffset")) : null;
  const publishedAt = status === ArticleStatus.PUBLISHED ? (current.publishedAt ?? new Date()) : current.publishedAt;

  await db.$transaction(async tx => {
    await tx.articleSection.deleteMany({ where: { articleId: id } });
    await tx.articleFaq.deleteMany({ where: { articleId: id } });
    await tx.articleSource.deleteMany({ where: { articleId: id } });
    await tx.article.update({ where: { id }, data: {
      title, slug, excerpt: text(formData, "excerpt"), seoTitle: text(formData, "seoTitle") || null, seoDescription: text(formData, "seoDescription") || null,
      body: lines(text(formData, "body")), keyTakeaways: lines(text(formData, "keyTakeaways")), readingTime: text(formData, "readingTime") || "5 min", tone: text(formData, "tone") || current.tone,
      status, featured: formData.get("featured") === "on", allowAds: formData.get("allowAds") === "on", categoryId: text(formData, "categoryId"), publishedAt, scheduledAt, featuredImageId,
      tags: { set: tags.map(tag => ({ id: tag.id })) }, sections: { create: sections }, faq: { create: faq }, sources: { create: sources },
      revisions: { create: { note: "Updated in admin", snapshot: { title, slug, status, scheduledAt, featuredImageId, updatedAt: new Date().toISOString() } } },
    }});
  });

  revalidatePath("/admin"); revalidatePath("/admin/articles"); revalidatePath(`/admin/articles/${id}`); revalidatePath(`/article/${current.slug}`); revalidatePath(`/article/${slug}`); revalidatePath("/", "layout");
  redirect(`/admin/articles/${id}?saved=1`);
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) redirect("/admin/articles");
  const article = await db.article.findUnique({ where: { id }, select: { slug: true } });
  if (!article) redirect("/admin/articles");
  await db.article.delete({ where: { id } });
  revalidatePath("/admin"); revalidatePath("/admin/articles"); revalidatePath(`/article/${article.slug}`); revalidatePath("/", "layout");
  redirect("/admin/articles?deleted=1");
}
