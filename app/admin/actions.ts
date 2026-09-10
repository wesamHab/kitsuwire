"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { writeAdminAudit } from "@/lib/admin-audit";
import { requireTrustedAdminMutation } from "@/lib/admin-security";
import { setFoxCursorEnabled } from "@/lib/site-settings";

export async function setFoxCursorAction(formData: FormData) {
  await requireTrustedAdminMutation();
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const enabled = formData.get("enabled") === "true";
  await setFoxCursorEnabled(enabled);
  await writeAdminAudit(session, {
    action: "settings.fox_cursor",
    entityType: "SiteSetting",
    entityId: "fox_cursor_enabled",
    summary: `Fox cursor ${enabled ? "enabled" : "disabled"}`,
    metadata: { enabled },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}
