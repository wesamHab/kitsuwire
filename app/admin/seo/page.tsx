import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, TriangleAlert } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Admin SEO", robots: { index: false, follow: false } };

export default async function AdminSeoPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const articles = await db.article.findMany({ orderBy: { updatedAt: "desc" }, include: { tags: true, sources: true } });
  const issues = articles.flatMap(article => {
    const rows: { id: string; title: string; issue: string }[] = [];
    if (!article.seoTitle) rows.push({ id: article.id, title: article.title, issue: "Missing SEO title" });
    if (!article.seoDescription) rows.push({ id: article.id, title: article.title, issue: "Missing SEO description" });
    if (!article.tags.length) rows.push({ id: article.id, title: article.title, issue: "No tags" });
    if (!article.sources.length) rows.push({ id: article.id, title: article.title, issue: "No sources" });
    return rows;
  });
  const healthy = Math.max(0, articles.length - new Set(issues.map(item => item.id)).size);
  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">GROWTH</p><h1>SEO Health</h1></div></header>
    <div className="admin-stat-grid"><article><span>Articles checked</span><strong>{articles.length}</strong><small>All database articles</small></article><article><span>Healthy articles</span><strong>{healthy}</strong><small>No basic SEO issue</small></article><article><span>Issues found</span><strong>{issues.length}</strong><small>Items needing attention</small></article><article><span>Sitemap</span><strong>Live</strong><small>Generated from published content</small></article></div>
    <section className="admin-panel admin-page-panel"><div className="admin-panel-head"><div><p className="admin-kicker">NEEDS ATTENTION</p><h2>SEO issues</h2></div><Search size={20}/></div>
      {issues.length ? <div className="admin-list">{issues.slice(0,100).map((item,index)=><div key={`${item.id}-${index}`}><div><strong>{item.title}</strong><span>{item.issue}</span></div><Link href={`/admin/articles/${item.id}`}>Fix</Link></div>)}</div> : <div className="admin-empty"><TriangleAlert size={30}/><h3>No basic SEO issues found</h3><p>All current articles have the core SEO fields checked by this first audit.</p></div>}
    </section>
  </main>;
}
