import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { isTrustedAdminRequest } from "@/lib/admin-security";
import { db } from "@/lib/db";
import { deleteStoredMedia, saveImageUpload } from "@/lib/media-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(request: Request, suffix: string) {
  const response = NextResponse.redirect(new URL(`/admin/media${suffix}`, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  if (!isTrustedAdminRequest(request.headers)) return redirectTo(request, "?error=request");

  let storedUrl: string | null = null;
  try {
    const formData = await request.formData();
    const upload = formData.get("file");
    const altText = String(formData.get("altText") ?? "").trim().slice(0, 500);
    if (!(upload instanceof File) || upload.size === 0) return redirectTo(request, "?error=missing");

    const saved = await saveImageUpload(upload);
    storedUrl = saved.url;
    try {
      await db.media.create({
        data: {
          kind: "IMAGE",
          filename: (upload.name || saved.storedName).slice(0, 255),
          url: saved.url,
          altText: altText || null,
          fileSize: saved.fileSize,
        },
      });
    } catch (error) {
      await deleteStoredMedia(saved.url).catch(() => undefined);
      storedUrl = null;
      throw error;
    }

    return redirectTo(request, "?uploaded=1");
  } catch (error) {
    if (storedUrl) await deleteStoredMedia(storedUrl).catch(() => undefined);
    const code = error instanceof Error ? error.message : "upload";
    const allowed = new Set(["unsupported_type", "invalid_size", "invalid_image"]);
    return redirectTo(request, `?error=${allowed.has(code) ? code : "upload"}`);
  }
}
