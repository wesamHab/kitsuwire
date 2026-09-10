"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAdminAudit } from "@/lib/admin-audit";
import { getAdminSession } from "@/lib/admin-auth";
import { requireTrustedAdminMutation } from "@/lib/admin-security";
import { db } from "@/lib/db";
import { resendNewsletterConfirmation } from "@/lib/newsletter";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  await requireTrustedAdminMutation();
  return session;
}

function idFrom(formData: FormData) { return String(formData.get("id") ?? "").trim(); }

export async function resendConfirmationAction(formData: FormData) {
  const session = await requireAdmin();
  const id = idFrom(formData);
  if (!id) redirect("/admin/newsletter");
  const result = await resendNewsletterConfirmation(id);
  await writeAdminAudit(session, { action: "newsletter.resend_confirmation", entityType: "NewsletterSubscriber", entityId: id, summary: "Resent newsletter confirmation", metadata: { delivered: result.delivered, configured: result.configured } });
  revalidatePath("/admin/newsletter");
  redirect(`/admin/newsletter?notice=${result.delivered ? "resent" : result.configured ? "delivery_failed" : "delivery_missing"}`);
}

export async function unsubscribeSubscriberAction(formData: FormData) {
  const session = await requireAdmin();
  const id = idFrom(formData);
  if (!id) redirect("/admin/newsletter");
  await db.newsletterSubscriber.update({ where: { id }, data: { isActive: false, unsubscribedAt: new Date(), confirmationTokenHash: null } }).catch(() => null);
  await writeAdminAudit(session, { action: "newsletter.unsubscribe", entityType: "NewsletterSubscriber", entityId: id, summary: "Unsubscribed newsletter recipient" });
  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?notice=unsubscribed");
}

export async function deleteSubscriberAction(formData: FormData) {
  const session = await requireAdmin();
  const id = idFrom(formData);
  if (!id) redirect("/admin/newsletter");
  await db.newsletterSubscriber.delete({ where: { id } }).catch(() => null);
  await writeAdminAudit(session, { action: "newsletter.delete", entityType: "NewsletterSubscriber", entityId: id, summary: "Deleted newsletter recipient record" });
  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?notice=deleted");
}
