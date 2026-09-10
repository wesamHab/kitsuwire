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
export const MAX_MEDIA_DIMENSION = 12000;
export const MAX_MEDIA_PIXELS = 50_000_000;

export function mediaRoot() {
  return process.env.MEDIA_ROOT || path.join(process.cwd(), "data", "uploads");
}

function validSignature(buffer: Buffer, mime: string) {
  if (mime === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  if (mime === "image/gif") return buffer.length >= 10 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  if (mime === "image/webp") return buffer.length >= 30 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

function jpegDimensions(buffer: Buffer) {
  let offset = 2;
  const sof = new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset++];
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) break;
    if (offset + 1 >= buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if (sof.has(marker) && length >= 7) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return { width, height };
    }
    offset += length;
  }
  return null;
}

function webpDimensions(buffer: Buffer) {
  const chunk = buffer.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X" && buffer.length >= 30) {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }
  if (chunk === "VP8 " && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L" && buffer.length >= 25 && buffer[20] === 0x2f) {
    const b1 = buffer[21], b2 = buffer[22], b3 = buffer[23], b4 = buffer[24];
    return { width: 1 + b1 + ((b2 & 0x3f) << 8), height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10) };
  }
  return null;
}

function imageDimensions(buffer: Buffer, mime: string) {
  if (mime === "image/png" && buffer.length >= 24) return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  if (mime === "image/gif" && buffer.length >= 10) return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  if (mime === "image/jpeg") return jpegDimensions(buffer);
  if (mime === "image/webp") return webpDimensions(buffer);
  return null;
}

function validateDimensions(dimensions: { width: number; height: number } | null) {
  if (!dimensions) throw new Error("invalid_image");
  const { width, height } = dimensions;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) throw new Error("invalid_image");
  if (width > MAX_MEDIA_DIMENSION || height > MAX_MEDIA_DIMENSION || width * height > MAX_MEDIA_PIXELS) throw new Error("image_dimensions");
  return dimensions;
}

export async function saveImageUpload(file: File) {
  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) throw new Error("unsupported_type");
  if (file.size <= 0 || file.size > MAX_MEDIA_BYTES) throw new Error("invalid_size");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validSignature(buffer, file.type)) throw new Error("invalid_image");
  const dimensions = validateDimensions(imageDimensions(buffer, file.type));

  const storedName = `${randomUUID()}.${extension}`;
  const root = mediaRoot();
  await mkdir(root, { recursive: true });
  await writeFile(/* turbopackIgnore: true */ path.join(root, storedName), buffer, { flag: "wx" });

  return {
    storedName,
    url: `/media/${storedName}`,
    mime: file.type,
    fileSize: buffer.length,
    width: dimensions.width,
    height: dimensions.height,
  };
}

export async function readStoredMedia(storedName: string) {
  const safeName = path.basename(storedName);
  if (safeName !== storedName) throw new Error("invalid_name");
  const extension = path.extname(safeName).slice(1).toLowerCase();
  const mime = EXTENSION_MIME[extension];
  if (!mime) throw new Error("invalid_type");
  const buffer = await readFile(/* turbopackIgnore: true */ path.join(mediaRoot(), safeName));
  return { buffer, mime };
}

export async function deleteStoredMedia(url: string) {
  const prefix = "/media/";
  if (!url.startsWith(prefix)) return;
  const storedName = url.slice(prefix.length);
  if (path.basename(storedName) !== storedName) return;
  try {
    await unlink(/* turbopackIgnore: true */ path.join(mediaRoot(), storedName));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}
