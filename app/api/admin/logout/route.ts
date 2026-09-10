import { NextResponse } from "next/server";
import { writeAdminAudit } from "@/lib/admin-audit";
import { clearAdminSession, getAdminSession } from "@/lib/admin-auth";
import { isTrustedAdminRequest } from "@/lib/admin-security";

export async function POST(request: Request) {
  if (!isTrustedAdminRequest(request.headers)) return new NextResponse("Forbidden", { status: 403 });
  const session = await getAdminSession();
  if (session) await writeAdminAudit(session, { action: "auth.logout", entityType: "User", entityId: session.id, summary: "Admin signed out" });
  await clearAdminSession();
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
