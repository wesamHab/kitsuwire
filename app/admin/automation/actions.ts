"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
}

export async function pruneAnalyticsAction() {
  await requireAdmin();
  const retentionDays = Math.max(30, Number(process.env.ANALYTICS_RETENTION_DAYS || 180));
  const cutoff = new Date(Date.now() - retentionDays * 86_400_000);
  const result = await db.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } });
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/automation");
  redirect(`/admin/automation?pruned=${result.count}&days=${retentionDays}`);
}
