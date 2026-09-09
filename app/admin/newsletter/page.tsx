import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, MailCheck, MailWarning, RefreshCw, Trash2, UserMinus, Users } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { newsletterDeliveryConfigured } from "@/lib/newsletter";
import { deleteSubscriberAction, resendConfirmationAction, unsubscribeSubscriberAction } from "./actions";

export const metadata = { title: "Admin Newsletter", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function stateOf(subscriber: { isActive: boolean; confirmedAt: Date | null; unsubscribedAt: Date | null }) {
  if (subscriber.isActive && subscriber.confirmedAt) return "Active";
  if (subscriber.unsubscribedAt) return "Unsubscribed";
  return "Pending";
}

const notices: Record<string,string> = {
  resent: "Confirmation delivery was triggered successfully.",
  delivery_failed: "The delivery webhook is configured, but the confirmation request failed.",
  delivery_missing: "No newsletter delivery webhook is configured yet.",
  unsubscribed: "Subscriber was marked as unsubscribed.",
  deleted: "Subscriber was permanently deleted.",
};

export default async function AdminNewsletterPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { notice } = await searchParams;

  const [subscribers, total, active, pending, unsubscribed] = await Promise.all([
    db.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "desc" }, take: 250 }),
    db.newsletterSubscriber.count(),
    db.newsletterSubscriber.count({ where: { isActive: true, confirmedAt: { not: null } } }),
    db.newsletterSubscriber.count({ where: { isActive: false, unsubscribedAt: null } }),
    db.newsletterSubscriber.count({ where: { unsubscribedAt: { not: null } } }),
  ]);
  const deliveryConfigured = newsletterDeliveryConfigured();

  return <main className="admin-subpage">
    <header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">AUDIENCE</p><h1>Newsletter</h1></div><Link className="admin-outline-btn" href="/api/admin/newsletter/export"><Download size={15}/> Export active CSV</Link></header>
    {notice && notices[notice] ? <p className={notice === "delivery_failed" || notice === "delivery_missing" ? "admin-error" : "admin-success"}>{notices[notice]}</p> : null}

    <div className="admin-stat-grid">
      <article><span>Total records</span><strong>{total}</strong><small>All newsletter addresses</small></article>
      <article><span>Active</span><strong>{active}</strong><small>Confirmed recipients</small></article>
      <article><span>Pending</span><strong>{pending}</strong><small>Awaiting confirmation</small></article>
      <article><span>Unsubscribed</span><strong>{unsubscribed}</strong><small>Do not send</small></article>
    </div>

    <section className="admin-panel admin-page-panel">
      <div className="admin-panel-head"><div><p className="admin-kicker">DELIVERY</p><h2>Confirmation email transport</h2></div>{deliveryConfigured ? <MailCheck size={22}/> : <MailWarning size={22}/>}</div>
      <p className="admin-panel-copy">Double opt-in is active in the database. Confirmation messages are sent through the provider-neutral delivery webhook when configured.</p>
      <div className="admin-newsletter-delivery"><span className={deliveryConfigured ? "ready" : "missing"}>{deliveryConfigured ? "WEBHOOK CONNECTED" : "WEBHOOK NOT CONNECTED"}</span><small>{deliveryConfigured ? "New signup requests can trigger confirmation delivery." : "Pending subscribers are stored, but no confirmation email can be delivered yet."}</small></div>
    </section>

    <section className="admin-panel admin-page-panel">
      <div className="admin-panel-head"><div><p className="admin-kicker">SUBSCRIBERS</p><h2>Audience records</h2></div><Users size={22}/></div>
      {subscribers.length ? <div className="admin-newsletter-table-wrap"><table className="admin-newsletter-table"><thead><tr><th>Email</th><th>Status</th><th>Source</th><th>Requested</th><th>Confirmed / sent</th><th>Actions</th></tr></thead><tbody>{subscribers.map(subscriber => {
        const state = stateOf(subscriber);
        return <tr key={subscriber.id}><td><strong>{subscriber.email}</strong></td><td><span className={`newsletter-state state-${state.toLowerCase()}`}>{state}</span></td><td>{subscriber.source ?? "—"}</td><td>{subscriber.subscribedAt.toLocaleString("en-GB")}</td><td><small>{subscriber.confirmedAt ? `Confirmed ${subscriber.confirmedAt.toLocaleString("en-GB")}` : subscriber.confirmationSentAt ? `Sent ${subscriber.confirmationSentAt.toLocaleString("en-GB")}` : "No confirmation delivered"}</small></td><td><div className="admin-newsletter-actions">{state !== "Active" ? <form action={resendConfirmationAction}><input type="hidden" name="id" value={subscriber.id}/><button type="submit" title="Send confirmation again"><RefreshCw size={14}/></button></form> : <form action={unsubscribeSubscriberAction}><input type="hidden" name="id" value={subscriber.id}/><button type="submit" title="Unsubscribe"><UserMinus size={14}/></button></form>}<form action={deleteSubscriberAction}><input type="hidden" name="id" value={subscriber.id}/><button className="danger" type="submit" title="Delete permanently"><Trash2 size={14}/></button></form></div></td></tr>;
      })}</tbody></table></div> : <div className="admin-empty"><Users size={30}/><h3>No newsletter records yet</h3><p>New signup requests from the public KitsuWire newsletter form will appear here.</p></div>}
      {total > subscribers.length ? <p className="admin-note">Showing the latest {subscribers.length} of {total} records.</p> : null}
    </section>
  </main>;
}
