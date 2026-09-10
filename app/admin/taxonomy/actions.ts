"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAdminAudit } from "@/lib/admin-audit";
import { getAdminSession } from "@/lib/admin-auth";
import { requireTrustedAdminMutation } from "@/lib/admin-security";
import { db } from "@/lib/db";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  await requireTrustedAdminMutation();
  return session;
}

export async function updateCategoryAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const label = text(formData, "label");
  const title = text(formData, "title");
  const description = text(formData, "description");
  if (!id || !label || !title || !description) redirect("/admin/taxonomy?error=category");

  await db.category.update({ where: { id }, data: { label, title, description } });
  await writeAdminAudit(session, { action: "category.update", entityType: "Category", entityId: id, summary: `Updated category: ${label}`, metadata: { title } });
  revalidatePath("/admin/taxonomy");
  revalidatePath("/", "layout");
  redirect("/admin/taxonomy?saved=category");
}

export async function createTagAction(formData: FormData) {
  const session = await requireAdmin();
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  if (!name || !slug) redirect("/admin/taxonomy?error=tag");

  const existing = await db.tag.findFirst({ where: { OR: [{ slug }, { name }] } });
  if (existing) redirect("/admin/taxonomy?error=duplicate-tag");
  const tag = await db.tag.create({ data: { name, slug } }).catch(() => redirect("/admin/taxonomy?error=duplicate-tag"));
  await writeAdminAudit(session, { action: "tag.create", entityType: "Tag", entityId: tag.id, summary: `Created tag: ${name}`, metadata: { slug } });
  revalidatePath("/admin/taxonomy");
  redirect("/admin/taxonomy?saved=tag");
}

export async function renameTagAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  if (!id || !name || !slug) redirect("/admin/taxonomy?error=tag");
  await db.tag.update({ where: { id }, data: { name, slug } }).catch(() => redirect("/admin/taxonomy?error=duplicate-tag"));
  await writeAdminAudit(session, { action: "tag.update", entityType: "Tag", entityId: id, summary: `Updated tag: ${name}`, metadata: { slug } });
  revalidatePath("/admin/taxonomy");
  revalidatePath("/", "layout");
  redirect("/admin/taxonomy?saved=tag");
}

export async function deleteTagAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const tag = await db.tag.findUnique({ where: { id }, include: { _count: { select: { articles: true } } } });
  if (!tag) redirect("/admin/taxonomy");
  if (tag._count.articles > 0) redirect("/admin/taxonomy?error=tag-in-use");
  await db.tag.delete({ where: { id } });
  await writeAdminAudit(session, { action: "tag.delete", entityType: "Tag", entityId: id, summary: `Deleted tag: ${tag.name}`, metadata: { slug: tag.slug } });
  revalidatePath("/admin/taxonomy");
  redirect("/admin/taxonomy?deleted=tag");
}
