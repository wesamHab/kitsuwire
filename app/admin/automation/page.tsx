import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot, Clock3, RefreshCw, SearchCheck, WandSparkles } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { auditArticleSeo } from "@/lib/seo-audit";
import { pruneAnalyticsAction } from "./actions";

export const metadata = { title: "Admin Automation", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminAutomationPage({ searchParams }: { searchParams: Promise<{ pruned?: string; days?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const params = await searchParams;
  const now = new Date();
  const [scheduled, articles, pageViews] = await Promise.all([
    db.article.count({ where: { status: "SCHEDULED", scheduledAt: { gt: now } } }),
    db.article.findMany({ where: { status: { not: "ARCHIVED" } }, include: { tags: true, sources: true, sections: { select: { id: true } }, faq: { select: { id: true } }, featuredImage: { select: { altText: true } } } }),
    db.pageView.count(),
  ]);
  const audits = articles.map(article => auditArticleSeo(article));
  const seoIssues = audits.reduce((sum, audit) => sum + audit.issues.length, 0);
  const staleArticles = audits.filter(audit => audit.issues.some(issue => issue.code === "stale")).length;
  const retentionDays = Math.max(30, Number(process.env.ANALYTICS_RETENTION_DAYS || 180));

  return <main className="admin-subpage">
    <header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">AUTOMATION</p><h1>Automation Control Center</h1></div><WandSparkles size={24}/></header>
    {params.pruned !== undefined ? <p className="admin-success">Analytics cleanup finished. Removed {params.pruned} event{params.pruned === "1" ? "" : "s"} older than {params.days} days.</p> : null}

    <div className="admin-stat-grid">
      <article><span>Scheduled articles</span><strong>{scheduled}</strong><small>Future publications</small></article>
      <article><span>SEO recommendations</span><strong>{seoIssues}</strong><small>Current audit findings</small></article>
      <article><span>Stale articles</span><strong>{staleArticles}</strong><small>Older content needing review</small></article>
      <article><span>Analytics events</span><strong>{pageViews}</strong><small>{retentionDays}-day retention target</small></article>
    </div>

    <section className="admin-panel admin-page-panel"><div className="admin-panel-head"><div><p className="admin-kicker">ACTIVE SYSTEMS</p><h2>Editorial automations</h2></div></div>
      <div className="admin-automation-grid">
        <article><SearchCheck size={22}/><div><strong>SEO health scan</strong><p>Runs live against article metadata, images, content depth, sources and freshness.</p></div><Link className="admin-outline-btn" href="/admin/seo">Open scan</Link></article>
        <article><RefreshCw size={22}/><div><strong>Stale content detection</strong><p>Flags published content that has not been updated for more than one year.</p></div><span>ACTIVE</span></article>
        <article><Clock3 size={22}/><div><strong>Scheduled publishing</strong><p>Articles become public automatically when their scheduled timestamp is reached.</p></div><span>ACTIVE · {scheduled} queued</span></article>
        <article><RefreshCw size={22}/><div><strong>Analytics retention cleanup</strong><p>Delete raw page-view events older than the configured retention window.</p></div><form action={pruneAnalyticsAction}><button className="admin-outline-btn" type="submit">Run cleanup</button></form></article>
        <article><Bot size={22}/><div><strong>AI draft generation</strong><p>Will create drafts for admin review. Automatic publishing will remain disabled by default.</p></div><span>NOT CONNECTED</span></article>
      </div>
    </section>

    <p className="admin-note">Recurring cron execution for maintenance jobs will be wired when the production VPS deployment is finalized. Current publishing and SEO checks already work without a cron process.</p>
  </main>;
}
