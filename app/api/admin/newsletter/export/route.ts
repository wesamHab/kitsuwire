import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { newsletterUnsubscribeUrl } from "@/lib/newsletter";

function csv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscribers = await db.newsletterSubscriber.findMany({
    where: { isActive: true, confirmedAt: { not: null } },
    orderBy: { confirmedAt: "desc" },
    select: { id: true, email: true, source: true, confirmedAt: true, subscribedAt: true },
  });
  const rows = [
    "email,source,confirmed_at,requested_at,unsubscribe_url",
    ...subscribers.map(item => [
      csv(item.email),
      csv(item.source ?? ""),
      csv(item.confirmedAt?.toISOString() ?? ""),
      csv(item.subscribedAt.toISOString()),
      csv(newsletterUnsubscribeUrl(item.id, item.email) ?? ""),
    ].join(",")),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="kitsuwire-newsletter-${new Date().toISOString().slice(0,10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
