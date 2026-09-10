import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Security Audit", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const events = await db.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return <main className="admin-subpage shell">
    <div className="admin-subpage-head"><div><p className="admin-kicker">SECURITY</p><h1>Admin audit log</h1><p>Recent privileged changes made through the KitsuWire control center.</p></div><Link href="/admin">← Dashboard</Link></div>
    <section className="admin-panel">
      <div className="admin-panel-head"><div><p className="admin-kicker">ACTIVITY</p><h2>Recent events</h2></div><ShieldCheck size={22}/></div>
      {events.length ? <div className="admin-list">{events.map(event => <div key={event.id}><div><span>{event.action}</span><strong>{event.summary}</strong><small>{event.actorEmail}{event.entityType ? ` · ${event.entityType}` : ""}</small></div><div><time>{event.createdAt.toLocaleString("en-GB")}</time></div></div>)}</div> : <p className="admin-panel-copy">No privileged changes have been recorded yet.</p>}
    </section>
  </main>;
}
