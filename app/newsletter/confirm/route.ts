import { NextResponse } from "next/server";
import { confirmNewsletterToken } from "@/lib/newsletter";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const ok = await confirmNewsletterToken(token);
  return NextResponse.redirect(new URL(ok ? "/newsletter/confirmed" : "/newsletter/confirmed?status=invalid", url.origin));
}
