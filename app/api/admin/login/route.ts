import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminSession, verifyPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }
  await createAdminSession(user.id);
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
