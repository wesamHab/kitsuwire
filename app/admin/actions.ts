"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { setFoxCursorEnabled } from "@/lib/site-settings";

export async function setFoxCursorAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const enabled = formData.get("enabled") === "true";
  await setFoxCursorEnabled(enabled);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}
