import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, BarChart3, FileText, Image, Mail, Search, ServerCog, Settings, Sparkles, Tags, Users, WandSparkles } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { getAnalyticsOverview } from "@/lib/analytics";
import { getFoxCursorEnabled } from "@/lib/site-settings";
import { setFoxCursorAction } from "./actions";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [published, drafts, scheduled, review, subscribers, foxCursorEnabled, recentArticles, analytics] = await Promise.all([
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.article.count({ where: { status: "DRAFT" } }),
    db.article.count({ where: { status: "SCHEDULED" } }),
    db.article.count({ where: { status: "REVIEW" } }),
    db.newsletterSubscriber.count({ where: { isActive: true, confirmedAt: { not: null } } }),
    getFoxCursorEnabled(),
    db.article.findMany({ orderBy: { updatedAt: "desc" }, take: 6, include: { category: true } }),
    getAnalyticsOverview(),
  ]);

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-logo">KITSU<span>WIRE</span><small>ADMIN</small></Link>
      <nav>
        <Link className="active" href="/admin"><Activity size={17}/> Dashboard</Link>
        <Link href="/admin/articles"><FileText size={17}/> Articles</Link>
        <Link href="/admin/media"><Image size={17}/> Media</Link>
        <Link href="/admin/taxonomy"><Tags size={17}/> Categories & Tags</Link>
        <Link href="/admin/newsletter"><Mail size={17}/> Newsletter</Link>
        <Link href="/admin/analytics"><BarChart3 size={17}/> Analytics</Link>
        <Link href="/admin/seo"><Search size={17}/> SEO</Link>
        <Link href="/admin/automation"><WandSparkles size={17}/> Automation</Link>
        <Link href="/admin/system"><ServerCog size={17}/> System</Link>
        <Link href="/admin/settings"><Settings size={17}/> Settings</Link>
      </nav>
      <form action="/api/admin/logout" method="post"><button className="admin-logout" type="submit">Sign out</button></form>
    </aside>

    <section className="admin-main">
      <header className="admin-topbar"><div><p className="admin-kicker">KITSUWIRE CONTROL CENTER</p><h1>Dashboard</h1></div><div className="admin-user"><span>{session.name ?? "Admin"}</span><small>{session.email}</small></div></header>

      <div className="admin-stat-grid">
        <article><span>Published</span><strong>{published}</strong><small>Live articles</small></article>
        <article><span>Drafts</span><strong>{drafts}</strong><small>Work in progress</small></article>
        <article><span>Scheduled</span><strong>{scheduled}</strong><small>Queued to publish</small></article>
        <article><span>Needs Review</span><strong>{review}</strong><small>Editorial queue</small></article>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-recent">
          <div className="admin-panel-head"><div><p className="admin-kicker">CONTENT</p><h2>Recent articles</h2></div><Link href="/admin/articles">View all</Link></div>
          <div className="admin-list">{recentArticles.map(article => <div key={article.id}><div><span>{article.category.label}</span><strong>{article.title}</strong></div><div><small>{article.status}</small><time>{article.updatedAt.toLocaleDateString("en-GB")}</time></div></div>)}</div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><div><p className="admin-kicker">EXPERIENCE</p><h2>Fox cursor</h2></div><Sparkles size={20}/></div>
          <p className="admin-panel-copy">Control the animated Kitsu fox mouse pointer for every visitor on the public website.</p>
          <div className="admin-setting-row"><div><strong>Animated fox cursor</strong><small>Current status: {foxCursorEnabled ? "Enabled" : "Disabled"}</small></div>
            <form action={setFoxCursorAction}><input type="hidden" name="enabled" value={foxCursorEnabled ? "false" : "true"}/><button className={foxCursorEnabled ? "admin-toggle on" : "admin-toggle"} type="submit" aria-label="Toggle fox cursor"><span/></button></form>
          </div>
        </section>

        <Link href="/admin/newsletter" className="admin-panel admin-mini-panel admin-mini-link"><Users/><div><span>Newsletter subscribers</span><strong>{subscribers}</strong><small>Confirmed active recipients</small></div></Link>
        <Link href="/admin/analytics" className="admin-panel admin-mini-panel admin-mini-link"><BarChart3/><div><span>Page views · 30 days</span><strong>{analytics.views30d}</strong><small>{analytics.views7d} in the last 7 days</small></div></Link>
      </div>
    </section>
  </main>;
}
