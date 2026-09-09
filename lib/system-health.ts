import "server-only";
import { mkdir, statfs } from "node:fs/promises";
import { db } from "@/lib/db";
import { mediaRoot } from "@/lib/media-storage";

function mb(bytes: number) { return Math.round(bytes / 1024 / 1024); }
function gb(bytes: number) { return Math.round((bytes / 1024 / 1024 / 1024) * 10) / 10; }

export async function getSystemHealth() {
  const dbStarted = performance.now();
  let database = { ok: false, latencyMs: 0 };
  try {
    await db.$queryRaw`SELECT 1`;
    database = { ok: true, latencyMs: Math.max(1, Math.round(performance.now() - dbStarted)) };
  } catch {
    database = { ok: false, latencyMs: Math.round(performance.now() - dbStarted) };
  }

  let storage: { ok: boolean; freeGb?: number; totalGb?: number; usedPercent?: number; path: string } = { ok: false, path: mediaRoot() };
  try {
    await mkdir(mediaRoot(), { recursive: true });
    const stats = await statfs(mediaRoot());
    const total = Number(stats.blocks) * Number(stats.bsize);
    const free = Number(stats.bavail) * Number(stats.bsize);
    storage = { ok: true, path: mediaRoot(), totalGb: gb(total), freeGb: gb(free), usedPercent: total > 0 ? Math.round(((total - free) / total) * 100) : 0 };
  } catch {
    storage = { ok: false, path: mediaRoot() };
  }

  const memory = process.memoryUsage();
  const adminSecretReady = Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
  const newsletterTokenSecretReady = Boolean((process.env.NEWSLETTER_TOKEN_SECRET && process.env.NEWSLETTER_TOKEN_SECRET.length >= 32) || adminSecretReady);
  const brevoApiKey = Boolean(process.env.BREVO_API_KEY);
  const brevoSender = Boolean(process.env.BREVO_SENDER_EMAIL);
  const newsletterDeliveryWebhook = Boolean(process.env.NEWSLETTER_DELIVERY_WEBHOOK_URL);

  return {
    database,
    storage,
    runtime: {
      node: process.version,
      environment: process.env.NODE_ENV ?? "unknown",
      uptimeSeconds: Math.floor(process.uptime()),
      rssMb: mb(memory.rss),
      heapUsedMb: mb(memory.heapUsed),
      heapTotalMb: mb(memory.heapTotal),
    },
    config: {
      databaseUrl: Boolean(process.env.DATABASE_URL),
      adminSessionSecret: adminSecretReady,
      mediaRoot: mediaRoot(),
      analyticsRetentionDays: Number(process.env.ANALYTICS_RETENTION_DAYS || 180),
      newsletterDeliveryWebhook,
      newsletterTokenSecret: newsletterTokenSecretReady,
      newsletterPublicUrl: process.env.NEWSLETTER_PUBLIC_URL || (process.env.NODE_ENV === "production" ? "https://kitsuwire.com" : "http://localhost:3000"),
      brevoApiKey,
      brevoSender,
      newsletterDeliveryMode: brevoApiKey && brevoSender ? "Brevo" : newsletterDeliveryWebhook ? "Webhook" : "Not connected",
    },
  };
}
