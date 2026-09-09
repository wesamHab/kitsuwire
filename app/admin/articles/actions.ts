"use server";

import { ArticleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const validStatuses = new Set(Object.values(ArticleStatus));

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function lines(value: string) {
  return value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
}

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

export async function createArticleAction(formData: FormData) {
  const session = await requireAdmin();
  const title = text(formData, "title");
  const slug = slugify(text(formData, "slug") || title);
  const categoryId = text(formData, "categoryId");
  const statusRaw = text(formData, "status");
  const status = validStatuses.has(statusRaw as ArticleStatus) ? statusRaw as ArticleStatus : ArticleStatus.DRAFT;
  if (!title || !slug || !categoryId) redirect("/admin/articles/new?error=missing");

  const exists = await db.article.findUnique({ where: { slug } });
  if (exists) redirect("/admin/articles/new?error=slug");

  const author = await db.author.upsert({ where: { name: session.name ?? "KitsuWire Editorial" }, update: {}, create: { name: session.name ?? "KitsuWire Editorial" } });
  const tags = await resolveTags(text(formData, "tags"));
  const now = new Date();
  const article = await db.article.create({
    data: {
      title,
      slug,
      excerpt: text(formData, "excerpt") || "Draft article — excerpt pending.",
      seoTitle: text(formData, "seoTitle") || null,
      seoDescription: text(formData, "seoDescription") || null,
      body: lines(text(formData, "body")),
      keyTakeaways: lines(text(formData, "keyTakeaways")),
      readingTime: text(formData, "readingTime") || "5 min",
      tone: text(formData, "tone") || "green",
      status,
      featured: formData.get("featured") === "on",
      allowAds: formData.get("allowAds") === "on",
      publishedAt: status === ArticleStatus.PUBLISHED ? now : null,
      categoryId,
      authorId: author.id,
      tags: { connect: tags.map(tag => ({ id: tag.id })) },
    },
  });

  await db.articleRevision.create({ data: { articleId: article.id, note: "Created in admin", snapshot: { title, slug, status } } });
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/", "layout");
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
  const publishedAt = status === ArticleStatus.PUBLISHED ? (current.publishedAt ?? new Date()) : current.publishedAt;

  await db.article.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: text(formData, "excerpt"),
      seoTitle: text(formData, "seoTitle") || null,
      seoDescription: text(formData, "seoDescription") || null,
      body: lines(text(formData, "body")),
      keyTakeaways: lines(text(formData, "keyTakeaways")),
      readingTime: text(formData, "readingTime") || "5 min",
      tone: text(formData, "tone") || current.tone,
      status,
      featured: formData.get("featured") === "on",
      allowAds: formData.get("allowAds") === "on",
      categoryId: text(formData, "categoryId"),
      publishedAt,
      tags: { set: tags.map(tag => ({ id: tag.id })) },
      revisions: { create: { note: "Updated in admin", snapshot: { title, slug, status, updatedAt: new Date().toISOString() } } },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
  revalidatePath(`/article/${current.slug}`);
  revalidatePath(`/article/${slug}`);
  revalidatePath("/", "layout");
  redirect(`/admin/articles/${id}?saved=1`);
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) redirect("/admin/articles");

  const article = await db.article.findUnique({ where: { id }, select: { slug: true } });
  if (!article) redirect("/admin/articles");

  await db.article.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(`/article/${article.slug}`);
  revalidatePath("/", "layout");
  redirect("/admin/articles?deleted=1");
}
