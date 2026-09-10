"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { requireTrustedAdminMutation } from "@/lib/admin-security";
import { db } from "@/lib/db";
import { resendNewsletterConfirmation } from "@/lib/newsletter";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  await requireTrustedAdminMutation();
}

function idFrom(formData: FormData) { return String(formData.get("id") ?? "").trim(); }

export async function resendConfirmationAction(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) redirect("/admin/newsletter");
  const result = await resendNewsletterConfirmation(id);
  revalidatePath("/admin/newsletter");
  redirect(`/admin/newsletter?notice=${result.delivered ? "resent" : result.configured ? "delivery_failed" : "delivery_missing"}`);
}

export async function unsubscribeSubscriberAction(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) redirect("/admin/newsletter");
  await db.newsletterSubscriber.update({ where: { id }, data: { isActive: false, unsubscribedAt: new Date(), confirmationTokenHash: null } }).catch(() => null);
  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?notice=unsubscribed");
}

export async function deleteSubscriberAction(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  if (!id) redirect("/admin/newsletter");
  await db.newsletterSubscriber.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?notice=deleted");
}
