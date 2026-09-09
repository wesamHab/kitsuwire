"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { deleteStoredMedia } from "@/lib/media-storage";

export async function deleteMediaAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/media");

  const media = await db.media.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });
  if (!media) redirect("/admin/media");
  if (media._count.articles > 0) redirect("/admin/media?error=in-use");

  await db.media.delete({ where: { id } });
  await deleteStoredMedia(media.url);
  revalidatePath("/admin/media");
  redirect("/admin/media?deleted=1");
}
