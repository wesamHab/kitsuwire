import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

const RESEND_COOLDOWN_MS = 2 * 60 * 1000;
const CONFIRMATION_TTL_MS = 48 * 60 * 60 * 1000;

export type NewsletterDeliveryResult = {
  configured: boolean;
  delivered: boolean;
  provider?: "brevo" | "webhook";
};

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

export function brevoDeliveryConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

export function newsletterDeliveryConfigured() {
  return brevoDeliveryConfigured() || Boolean(process.env.NEWSLETTER_DELIVERY_WEBHOOK_URL);
}

function confirmationHtml(confirmationUrl: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f1e8;font-family:Arial,sans-serif;color:#111"><div style="max-width:620px;margin:0 auto;padding:40px 24px"><div style="background:#111815;border-radius:20px;padding:38px;color:#fff"><div style="font-size:13px;letter-spacing:2px;color:#c9ff42;font-weight:700">KITSUWIRE</div><h1 style="font-size:30px;line-height:1.15;margin:18px 0 12px">Confirm your newsletter subscription.</h1><p style="font-size:16px;line-height:1.65;color:#d6ddd8;margin:0 0 28px">One click confirms that you want KitsuWire intelligence on AI, technology, software and markets in your inbox.</p><a href="${confirmationUrl}" style="display:inline-block;background:#c9ff42;color:#111815;text-decoration:none;font-weight:800;padding:14px 20px;border-radius:999px">Confirm subscription</a><p style="font-size:12px;line-height:1.6;color:#89958f;margin:28px 0 0">This confirmation link expires after 48 hours. If you did not request this subscription, you can ignore this email.</p></div></div></body></html>`;
}

async function deliverViaBrevo(email: string, confirmationUrl: string): Promise<NewsletterDeliveryResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) return { configured: false, delivered: false };

  const payload = {
    sender: { name: process.env.BREVO_SENDER_NAME || "KitsuWire", email: senderEmail },
    to: [{ email }],
    subject: "Confirm your KitsuWire subscription",
    htmlContent: confirmationHtml(confirmationUrl),
    ...(process.env.BREVO_REPLY_TO_EMAIL ? { replyTo: { email: process.env.BREVO_REPLY_TO_EMAIL, name: "KitsuWire" } } : {}),
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return { configured: true, delivered: response.ok, provider: "brevo" };
  } catch {
    return { configured: true, delivered: false, provider: "brevo" };
  }
}

async function deliverViaWebhook(email: string, confirmationUrl: string): Promise<NewsletterDeliveryResult> {
  const endpoint = process.env.NEWSLETTER_DELIVERY_WEBHOOK_URL;
  if (!endpoint) return { configured: false, delivered: false };

  const payload = JSON.stringify({ event: "newsletter.confirmation_requested", brand: "KitsuWire", to: email, confirmationUrl });
  const headers: Record<string, string> = { "content-type": "application/json" };
  const secret = process.env.NEWSLETTER_DELIVERY_WEBHOOK_SECRET;
  if (secret) headers["x-kitsuwire-signature"] = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const response = await fetch(endpoint, { method: "POST", headers, body: payload, signal: AbortSignal.timeout(8000) });
    return { configured: true, delivered: response.ok, provider: "webhook" };
  } catch {
    return { configured: true, delivered: false, provider: "webhook" };
  }
}

async function deliverConfirmation(email: string, rawToken: string): Promise<NewsletterDeliveryResult> {
  const confirmationUrl = `${publicBaseUrl()}/newsletter/confirm?token=${encodeURIComponent(rawToken)}`;
  if (brevoDeliveryConfigured()) return deliverViaBrevo(email, confirmationUrl);
  return deliverViaWebhook(email, confirmationUrl);
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
    create: { email, source: source.slice(0, 80), isActive: false, confirmationTokenHash: hash, lastConfirmationRequestedAt: now, unsubscribedAt: null },
    update: { source: source.slice(0, 80), isActive: false, confirmationTokenHash: hash, lastConfirmationRequestedAt: now, unsubscribedAt: null },
  });

  const delivery = await deliverConfirmation(email, rawToken);
  if (delivery.delivered) await db.newsletterSubscriber.update({ where: { email }, data: { confirmationSentAt: new Date() } });
  return { ok: true as const, status: "accepted" as const, delivery };
}

export async function confirmNewsletterToken(rawToken: string) {
  if (!rawToken || rawToken.length > 200) return false;
  const hash = tokenHash(rawToken);
  const subscriber = await db.newsletterSubscriber.findUnique({ where: { confirmationTokenHash: hash } });
  if (!subscriber || !subscriber.lastConfirmationRequestedAt) return false;
  const age = Date.now() - subscriber.lastConfirmationRequestedAt.getTime();
  if (age < 0 || age > CONFIRMATION_TTL_MS) {
    await db.newsletterSubscriber.update({ where: { id: subscriber.id }, data: { confirmationTokenHash: null } });
    return false;
  }
  await db.newsletterSubscriber.update({ where: { id: subscriber.id }, data: { isActive: true, confirmedAt: subscriber.confirmedAt ?? new Date(), confirmationTokenHash: null, unsubscribedAt: null } });
  return true;
}

export async function resendNewsletterConfirmation(subscriberId: string) {
  const subscriber = await db.newsletterSubscriber.findUnique({ where: { id: subscriberId } });
  if (!subscriber || subscriber.isActive) return { configured: newsletterDeliveryConfigured(), delivered: false };
  const rawToken = randomBytes(32).toString("base64url");
  const now = new Date();
  await db.newsletterSubscriber.update({ where: { id: subscriber.id }, data: { confirmationTokenHash: tokenHash(rawToken), lastConfirmationRequestedAt: now, unsubscribedAt: null } });
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
  await db.newsletterSubscriber.update({ where: { id }, data: { isActive: false, unsubscribedAt: new Date(), confirmationTokenHash: null } });
  return true;
}
