import { NextResponse } from "next/server";
import { unsubscribeNewsletter } from "@/lib/newsletter";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const ok = await unsubscribeNewsletter(id, token);
  return NextResponse.redirect(new URL(ok ? "/newsletter/unsubscribed" : "/newsletter/unsubscribed?status=invalid", url.origin));
}
