import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;

type Attempt = { failures: number; resetAt: number };
const loginAttempts = new Map<string, Attempt>();

function normalizedHost(value: string | null) {
  return (value ?? "").split(",")[0]?.trim().toLowerCase();
}

function sameOrigin(headerStore: Headers) {
  const origin = headerStore.get("origin");
  const host = normalizedHost(headerStore.get("x-forwarded-host") || headerStore.get("host"));
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

export function isTrustedAdminRequest(headerStore: Headers) {
  const fetchSite = headerStore.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  return sameOrigin(headerStore);
}

export async function requireTrustedAdminMutation() {
  const headerStore = await headers();
  if (!isTrustedAdminRequest(headerStore)) throw new Error("Untrusted admin mutation origin.");
}

function clientAddress(headerStore: Headers) {
  return normalizedHost(
    headerStore.get("cf-connecting-ip") ||
    headerStore.get("x-real-ip") ||
    headerStore.get("x-forwarded-for") ||
    "unknown"
  );
}

export function adminLoginRateLimitKey(headerStore: Headers, email: string) {
  const raw = `${clientAddress(headerStore)}:${email.trim().toLowerCase()}`;
  return createHash("sha256").update(raw).digest("hex");
}

export function checkAdminLoginRateLimit(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    if (attempt) loginAttempts.delete(key);
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (attempt.failures < LOGIN_MAX_FAILURES) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((attempt.resetAt - now) / 1000)) };
}

export function recordAdminLoginFailure(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { failures: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  attempt.failures += 1;
  loginAttempts.set(key, attempt);
}

export function clearAdminLoginFailures(key: string) {
  loginAttempts.delete(key);
}
