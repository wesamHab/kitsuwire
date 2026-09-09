import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, ExternalLink, Globe2, Newspaper } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { getAnalyticsOverview } from "@/lib/analytics";

export const metadata = { title: "Admin Analytics", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const analytics = await getAnalyticsOverview();
  const articleRows = analytics.topArticles.length ? await db.article.findMany({ where: { slug: { in: analytics.topArticles.map(item => item.slug) } }, select: { slug: true, title: true } }) : [];
  const titleBySlug = new Map(articleRows.map(article => [article.slug, article.title]));
  const maxDaily = Math.max(1, ...analytics.daily.map(item => item.views));

  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">GROWTH</p><h1>Analytics</h1></div><span className="admin-privacy-badge">No cookies · No IP storage</span></header>
    <div className="admin-stat-grid">
      <article><span>Last 24 hours</span><strong>{analytics.views24h}</strong><small>Page views</small></article>
      <article><span>Last 7 days</span><strong>{analytics.views7d}</strong><small>Page views</small></article>
      <article><span>Last 30 days</span><strong>{analytics.views30d}</strong><small>Page views</small></article>
      <article><span>Article views</span><strong>{analytics.articleViews30d}</strong><small>Last 30 days</small></article>
    </div>

    <section className="admin-panel admin-page-panel"><div className="admin-panel-head"><div><p className="admin-kicker">30 DAY TREND</p><h2>Traffic over time</h2></div><BarChart3 size={20}/></div>
      {analytics.daily.length ? <div className="admin-traffic-chart">{analytics.daily.map(item => <div className="admin-traffic-day" key={item.day} title={`${item.day}: ${item.views} views`}><span style={{height:`${Math.max(6,(item.views/maxDaily)*100)}%`}}/><small>{new Date(`${item.day}T00:00:00Z`).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</small></div>)}</div> : <div className="admin-empty"><BarChart3 size={30}/><h3>No traffic data yet</h3><p>Public page views will appear here automatically once visitors browse KitsuWire.</p></div>}
    </section>

    <div className="admin-analytics-grid">
      <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">CONTENT</p><h2>Top articles</h2></div><Newspaper size={20}/></div>
        {analytics.topArticles.length ? <div className="admin-list">{analytics.topArticles.map(item => <div key={item.slug}><div><span>/{item.slug}</span><strong>{titleBySlug.get(item.slug) ?? item.slug}</strong></div><div><strong>{item.views}</strong><small>views</small></div></div>)}</div> : <p className="admin-panel-copy">No article views recorded yet.</p>}
      </section>

      <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">DISCOVERY</p><h2>Traffic sources</h2></div><Globe2 size={20}/></div>
        {analytics.referrers.length ? <div className="admin-list">{analytics.referrers.map(item => <div key={item.host}><div><span>REFERRER</span><strong>{item.host}</strong></div><div><strong>{item.views}</strong><small>views</small></div></div>)}</div> : <p className="admin-panel-copy">Direct traffic or no external referrers recorded yet.</p>}
      </section>
    </div>

    <section className="admin-panel admin-page-panel"><div className="admin-panel-head"><div><p className="admin-kicker">PAGES</p><h2>Top paths</h2></div><ExternalLink size={20}/></div>
      {analytics.topPaths.length ? <div className="admin-list">{analytics.topPaths.map(item => <div key={item.path}><div><span>PAGE</span><strong>{item.path}</strong></div><div><strong>{item.views}</strong><small>views</small></div></div>)}</div> : <p className="admin-panel-copy">No page views recorded yet.</p>}
    </section>
  </main>;
}
