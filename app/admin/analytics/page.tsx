import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, FileText, Users } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Admin Analytics", robots: { index: false, follow: false } };

export default async function AdminAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const [published, subscribers, categories] = await Promise.all([
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.newsletterSubscriber.count({ where: { isActive: true } }),
    db.category.findMany({ include: { _count: { select: { articles: true } } }, orderBy: { title: "asc" } }),
  ]);
  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">GROWTH</p><h1>Analytics</h1></div></header>
    <div className="admin-stat-grid"><article><span>Published articles</span><strong>{published}</strong><small>Current live inventory</small></article><article><span>Newsletter subscribers</span><strong>{subscribers}</strong><small>Active subscribers</small></article><article><span>Traffic tracking</span><strong>—</strong><small>Provider not connected yet</small></article><article><span>Avg. read time</span><strong>—</strong><small>Requires analytics events</small></article></div>
    <section className="admin-panel admin-page-panel"><div className="admin-panel-head"><div><p className="admin-kicker">CONTENT DISTRIBUTION</p><h2>Articles by category</h2></div><BarChart3 size={20}/></div><div className="admin-list">{categories.map(category=><div key={category.id}><div><span>{category.slug}</span><strong>{category.title}</strong></div><strong>{category._count.articles}</strong></div>)}</div></section>
    <section className="admin-panel admin-page-panel"><div className="admin-empty"><Users size={30}/><h3>Visitor analytics connection comes next</h3><p>The route is active and ready for page views, unique visitors, traffic sources, scroll depth and top-article metrics once we connect the analytics data source.</p></div></section>
  </main>;
}
