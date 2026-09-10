"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAdminAudit } from "@/lib/admin-audit";
import { getAdminSession } from "@/lib/admin-auth";
import { requireTrustedAdminMutation } from "@/lib/admin-security";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  await requireTrustedAdminMutation();
  return session;
}

export async function pruneAnalyticsAction() {
  const session = await requireAdmin();
  const configured = Number(process.env.ANALYTICS_RETENTION_DAYS || 180);
  const retentionDays = Number.isFinite(configured) ? Math.min(3650, Math.max(30, configured)) : 180;
  const cutoff = new Date(Date.now() - retentionDays * 86_400_000);
  const result = await db.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } });
  await writeAdminAudit(session, { action: "analytics.prune", entityType: "PageView", summary: `Pruned ${result.count} analytics events`, metadata: { retentionDays, deleted: result.count } });
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/automation");
  redirect(`/admin/automation?pruned=${result.count}&days=${retentionDays}`);
}
