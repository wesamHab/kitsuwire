import "server-only";
import path from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const EXTENSION_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(MIME_EXTENSIONS).map(([mime, extension]) => [extension, mime]),
);

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

export function mediaRoot() {
  return process.env.MEDIA_ROOT || path.join(process.cwd(), "data", "uploads");
}

function validSignature(buffer: Buffer, mime: string) {
  if (mime === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  if (mime === "image/gif") return buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  if (mime === "image/webp") return buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export async function saveImageUpload(file: File) {
  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) throw new Error("unsupported_type");
  if (file.size <= 0 || file.size > MAX_MEDIA_BYTES) throw new Error("invalid_size");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validSignature(buffer, file.type)) throw new Error("invalid_image");

  const storedName = `${randomUUID()}.${extension}`;
  const root = mediaRoot();
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, storedName), buffer, { flag: "wx" });

  return {
    storedName,
    url: `/media/${storedName}`,
    mime: file.type,
    fileSize: buffer.length,
  };
}

export async function readStoredMedia(storedName: string) {
  const safeName = path.basename(storedName);
  if (safeName !== storedName) throw new Error("invalid_name");
  const extension = path.extname(safeName).slice(1).toLowerCase();
  const mime = EXTENSION_MIME[extension];
  if (!mime) throw new Error("invalid_type");
  const buffer = await readFile(path.join(mediaRoot(), safeName));
  return { buffer, mime };
}

export async function deleteStoredMedia(url: string) {
  const prefix = "/media/";
  if (!url.startsWith(prefix)) return;
  const storedName = url.slice(prefix.length);
  if (path.basename(storedName) !== storedName) return;
  try {
    await unlink(path.join(mediaRoot(), storedName));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}
