import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function cleanPath(value: unknown) {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path.startsWith("/") || path.length > 300) return null;
  if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) return null;
  return path;
}

function cleanHost(value: unknown) {
  if (typeof value !== "string") return null;
  const host = value.trim().toLowerCase();
  if (!host || host.length > 180) return null;
  return /^[a-z0-9.-]+(?::\d+)?$/.test(host) ? host : null;
}

function cleanAnalyticsId(value: unknown) {
  if (typeof value !== "string") return null;
  const id = value.trim().toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id) ? id : null;
}

function articleSlugFromPath(path: string) {
  const match = path.match(/^\/article\/([a-z0-9-]+)\/?$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return new NextResponse(null, { status: 415 });
    const body = await request.json().catch(() => null);
    const path = cleanPath(body?.path);
    const visitorId = cleanAnalyticsId(body?.visitorId);
    const sessionId = cleanAnalyticsId(body?.sessionId);
    if (!path || !visitorId || !sessionId) return new NextResponse(null, { status: 400 });

    await db.pageView.create({
      data: {
        path,
        articleSlug: articleSlugFromPath(path),
        referrerHost: cleanHost(body?.referrerHost),
        visitorId,
        sessionId,
      },
    });

    return new NextResponse(null, { status: 204, headers: { "cache-control": "no-store" } });
  } catch {
    return new NextResponse(null, { status: 204, headers: { "cache-control": "no-store" } });
  }
}
