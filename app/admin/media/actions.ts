"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { requireTrustedAdminMutation } from "@/lib/admin-security";
import { db } from "@/lib/db";
import { deleteStoredMedia } from "@/lib/media-storage";

export async function deleteMediaAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  await requireTrustedAdminMutation();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/media");

  const media = await db.media.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });
  if (!media) redirect("/admin/media");
  if (media._count.articles > 0) redirect("/admin/media?error=in-use");

  try {
    await deleteStoredMedia(media.url);
  } catch {
    redirect("/admin/media?error=delete-file");
  }

  await db.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  redirect("/admin/media?deleted=1");
}
