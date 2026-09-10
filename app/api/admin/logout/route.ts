import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-auth";
import { isTrustedAdminRequest } from "@/lib/admin-security";

export async function POST(request: Request) {
  if (!isTrustedAdminRequest(request.headers)) return new NextResponse("Forbidden", { status: 403 });
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
