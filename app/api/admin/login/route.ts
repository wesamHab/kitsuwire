import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeAdminAudit } from "@/lib/admin-audit";
import { createAdminSession, verifyPassword } from "@/lib/admin-auth";
import {
  adminLoginRateLimitKey,
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  isTrustedAdminRequest,
  recordAdminLoginFailure,
} from "@/lib/admin-security";

function redirectLogin(request: Request, error: string, retryAfterSeconds?: number) {
  const response = NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent(error)}`, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  if (retryAfterSeconds) response.headers.set("Retry-After", String(retryAfterSeconds));
  return response;
}

export async function POST(request: Request) {
  if (!isTrustedAdminRequest(request.headers)) return redirectLogin(request, "request");

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(form.get("password") ?? "").slice(0, 512);
  const key = adminLoginRateLimitKey(request.headers, email);
  const limit = checkAdminLoginRateLimit(key);
  if (!limit.allowed) return redirectLogin(request, "rate", limit.retryAfterSeconds);

  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  const valid = Boolean(user && user.role === "ADMIN" && user.passwordHash && verifyPassword(password, user.passwordHash));
  if (!valid || !user) {
    recordAdminLoginFailure(key);
    return redirectLogin(request, "credentials");
  }

  clearAdminLoginFailures(key);
  await createAdminSession(user.id);
  await writeAdminAudit({ id: user.id, email: user.email }, { action: "auth.login", entityType: "User", entityId: user.id, summary: "Admin signed in" });
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
