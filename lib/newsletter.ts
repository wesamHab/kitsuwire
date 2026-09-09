import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export type NewsletterDeliveryResult = { configured: boolean; delivered: boolean };

export function normalizeNewsletterEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidNewsletterEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function publicBaseUrl() {
  return (process.env.NEWSLETTER_PUBLIC_URL || (process.env.NODE_ENV === "production" ? "https://kitsuwire.com" : "http://localhost:3000")).replace(/\/$/, "");
}

function unsubscribeSecret() {
  return process.env.NEWSLETTER_TOKEN_SECRET || process.env.ADMIN_SESSION_SECRET || "";
}

export function newsletterDeliveryConfigured() {
  return Boolean(process.env.NEWSLETTER_DELIVERY_WEBHOOK_URL);
}

async function deliverConfirmation(email: string, rawToken: string): Promise<NewsletterDeliveryResult> {
  const endpoint = process.env.NEWSLETTER_DELIVERY_WEBHOOK_URL;
  if (!endpoint) return { configured: false, delivered: false };

  const confirmationUrl = `${publicBaseUrl()}/newsletter/confirm?token=${encodeURIComponent(rawToken)}`;
  const payload = JSON.stringify({
    event: "newsletter.confirmation_requested",
    brand: "KitsuWire",
    to: email,
    confirmationUrl,
  });
  const headers: Record<string, string> = { "content-type": "application/json" };
  const secret = process.env.NEWSLETTER_DELIVERY_WEBHOOK_SECRET;
  if (secret) headers["x-kitsuwire-signature"] = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const response = await fetch(endpoint, { method: "POST", headers, body: payload, signal: AbortSignal.timeout(8000) });
    return { configured: true, delivered: response.ok };
  } catch {
    return { configured: true, delivered: false };
  }
}

export async function requestNewsletterSubscription(emailInput: string, source = "website") {
  const email = normalizeNewsletterEmail(emailInput);
  if (!isValidNewsletterEmail(email)) return { ok: false as const, reason: "invalid_email" as const, delivery: { configured: newsletterDeliveryConfigured(), delivered: false } };

  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing?.isActive && existing.confirmedAt) {
    return { ok: true as const, status: "accepted" as const, delivery: { configured: newsletterDeliveryConfigured(), delivered: true } };
  }

  const now = new Date();
  if (existing?.lastConfirmationRequestedAt && now.getTime() - existing.lastConfirmationRequestedAt.getTime() < RESEND_COOLDOWN_MS) {
    return { ok: true as const, status: "accepted" as const, delivery: { configured: newsletterDeliveryConfigured(), delivered: false } };
  }

  const rawToken = randomBytes(32).toString("base64url");
  const hash = tokenHash(rawToken);
  await db.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      source: source.slice(0, 80),
      isActive: false,
      confirmationTokenHash: hash,
      lastConfirmationRequestedAt: now,
      unsubscribedAt: null,
    },
    update: {
      source: source.slice(0, 80),
      isActive: false,
      confirmationTokenHash: hash,
      lastConfirmationRequestedAt: now,
      unsubscribedAt: null,
    },
  });

  const delivery = await deliverConfirmation(email, rawToken);
  if (delivery.delivered) {
    await db.newsletterSubscriber.update({ where: { email }, data: { confirmationSentAt: new Date() } });
  }
  return { ok: true as const, status: "accepted" as const, delivery };
}

export async function confirmNewsletterToken(rawToken: string) {
  if (!rawToken || rawToken.length > 200) return false;
  const hash = tokenHash(rawToken);
  const subscriber = await db.newsletterSubscriber.findUnique({ where: { confirmationTokenHash: hash } });
  if (!subscriber) return false;
  await db.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      isActive: true,
      confirmedAt: subscriber.confirmedAt ?? new Date(),
      confirmationTokenHash: null,
      unsubscribedAt: null,
    },
  });
  return true;
}

export async function resendNewsletterConfirmation(subscriberId: string) {
  const subscriber = await db.newsletterSubscriber.findUnique({ where: { id: subscriberId } });
  if (!subscriber || subscriber.isActive) return { configured: newsletterDeliveryConfigured(), delivered: false };
  const rawToken = randomBytes(32).toString("base64url");
  const now = new Date();
  await db.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { confirmationTokenHash: tokenHash(rawToken), lastConfirmationRequestedAt: now, unsubscribedAt: null },
  });
  const delivery = await deliverConfirmation(subscriber.email, rawToken);
  if (delivery.delivered) await db.newsletterSubscriber.update({ where: { id: subscriber.id }, data: { confirmationSentAt: new Date() } });
  return delivery;
}

function unsubscribeSignature(id: string, email: string) {
  const secret = unsubscribeSecret();
  if (secret.length < 32) return "";
  return createHmac("sha256", secret).update(`${id}:${email}`).digest("base64url");
}

export function newsletterUnsubscribeUrl(id: string, email: string) {
  const signature = unsubscribeSignature(id, email);
  if (!signature) return null;
  return `${publicBaseUrl()}/newsletter/unsubscribe?id=${encodeURIComponent(id)}&token=${encodeURIComponent(signature)}`;
}

export async function unsubscribeNewsletter(id: string, token: string) {
  const subscriber = await db.newsletterSubscriber.findUnique({ where: { id } });
  if (!subscriber) return false;
  const expected = unsubscribeSignature(subscriber.id, subscriber.email);
  if (!expected || expected.length !== token.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(token))) return false;
  await db.newsletterSubscriber.update({
    where: { id },
    data: { isActive: false, unsubscribedAt: new Date(), confirmationTokenHash: null },
  });
  return true;
}
