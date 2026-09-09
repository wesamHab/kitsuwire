import { NextResponse } from "next/server";
import { requestNewsletterSubscription } from "@/lib/newsletter";

export async function POST(request: Request) {
  let payload: { email?: string; source?: string } = {};
  try { payload = await request.json(); } catch { return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 }); }

  const result = await requestNewsletterSubscription(String(payload.email ?? ""), String(payload.source ?? "website"));
  if (!result.ok) return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });

  const message = result.delivery.configured
    ? "If the address can be subscribed, a confirmation email will arrive shortly."
    : "Your subscription request was saved. Confirmation email delivery is not connected yet.";

  return NextResponse.json({ ok: true, message, deliveryConfigured: result.delivery.configured });
}
