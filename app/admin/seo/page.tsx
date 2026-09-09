import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Search, TriangleAlert } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { auditArticleSeo } from "@/lib/seo-audit";

export const metadata = { title: "Admin SEO", robots: { index: false, follow: false } };

export default async function AdminSeoPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const articles = await db.article.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    include: {
      tags: true,
      sources: true,
      sections: { select: { id: true } },
      faq: { select: { id: true } },
      featuredImage: { select: { altText: true } },
      category: true,
    },
  });

  const audited = articles.map(article => ({ article, audit: auditArticleSeo(article) })).sort((a, b) => a.audit.score - b.audit.score || a.article.title.localeCompare(b.article.title));
  const average = audited.length ? Math.round(audited.reduce((sum, item) => sum + item.audit.score, 0) / audited.length) : 0;
  const excellent = audited.filter(item => item.audit.score >= 90).length;
  const critical = audited.reduce((sum, item) => sum + item.audit.issues.filter(issue => issue.severity === "critical").length, 0);
  const needsWork = audited.filter(item => item.audit.score < 75).length;
  const issueCount = audited.reduce((sum, item) => sum + item.audit.issues.length, 0);

  return <main className="admin-subpage">
    <header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">GROWTH</p><h1>SEO Control Center</h1></div></header>

    <div className="admin-stat-grid">
      <article><span>Average SEO score</span><strong>{average}</strong><small>Across {audited.length} active articles</small></article>
      <article><span>Excellent</span><strong>{excellent}</strong><small>Score 90–100</small></article>
      <article><span>Needs work</span><strong>{needsWork}</strong><small>Below score 75</small></article>
      <article><span>Critical issues</span><strong>{critical}</strong><small>{issueCount} total recommendations</small></article>
    </div>

    <section className="admin-panel admin-page-panel">
      <div className="admin-panel-head"><div><p className="admin-kicker">ARTICLE AUDIT</p><h2>SEO scores</h2></div><Search size={20}/></div>
      {audited.length ? <div className="admin-seo-table-wrap"><table className="admin-seo-table"><thead><tr><th>Article</th><th>Status</th><th>Score</th><th>Priority issue</th><th></th></tr></thead><tbody>{audited.map(({ article, audit }) => {
        const primary = audit.issues.find(issue => issue.severity === "critical") ?? audit.issues.find(issue => issue.severity === "warning") ?? audit.issues[0];
        const scoreClass = audit.score >= 90 ? "seo-score-good" : audit.score >= 75 ? "seo-score-ok" : audit.score >= 55 ? "seo-score-warn" : "seo-score-bad";
        return <tr key={article.id}><td><div className="admin-seo-title"><span>{article.category.label}</span><strong>{article.title}</strong><small>{audit.issues.length} recommendation{audit.issues.length === 1 ? "" : "s"}</small></div></td><td><span className={`admin-status status-${article.status.toLowerCase()}`}>{article.status}</span></td><td><div className={`admin-seo-score ${scoreClass}`}><strong>{audit.score}</strong><span>{audit.grade}</span></div></td><td>{primary ? <div className={`admin-seo-issue severity-${primary.severity}`}><span>{primary.severity}</span><strong>{primary.label}</strong></div> : <div className="admin-seo-clean"><CheckCircle2 size={16}/> No issues</div>}</td><td><Link className="admin-outline-btn" href={`/admin/articles/${article.id}`}>Fix</Link></td></tr>;
      })}</tbody></table></div> : <div className="admin-empty"><TriangleAlert size={30}/><h3>No articles to audit</h3><p>Create an article first, then its SEO score will appear here automatically.</p></div>}
    </section>

    <section className="admin-panel admin-page-panel">
      <div className="admin-panel-head"><div><p className="admin-kicker">CHECKS</p><h2>What KitsuWire audits</h2></div></div>
      <div className="admin-seo-check-grid">
        <article><strong>Search metadata</strong><span>SEO title and meta-description presence and length.</span></article>
        <article><strong>Content depth</strong><span>Excerpt, structured sections, FAQ and source coverage.</span></article>
        <article><strong>Discoverability</strong><span>Tags and article freshness for published content.</span></article>
        <article><strong>Images</strong><span>Featured-image availability and alternative text.</span></article>
      </div>
    </section>
  </main>;
}
