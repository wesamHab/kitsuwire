import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { saveImageUpload } from "@/lib/media-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(request: Request, suffix: string) {
  return NextResponse.redirect(new URL(`/admin/media${suffix}`, request.url), 303);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.redirect(new URL("/admin/login", request.url), 303);

  try {
    const formData = await request.formData();
    const upload = formData.get("file");
    const altText = String(formData.get("altText") ?? "").trim();
    if (!(upload instanceof File) || upload.size === 0) return redirectTo(request, "?error=missing");

    const saved = await saveImageUpload(upload);
    await db.media.create({
      data: {
        kind: "IMAGE",
        filename: upload.name || saved.storedName,
        url: saved.url,
        altText: altText || null,
        fileSize: saved.fileSize,
      },
    });

    return redirectTo(request, "?uploaded=1");
  } catch (error) {
    const code = error instanceof Error ? error.message : "upload";
    const allowed = new Set(["unsupported_type", "invalid_size", "invalid_image"]);
    return redirectTo(request, `?error=${allowed.has(code) ? code : "upload"}`);
  }
}
