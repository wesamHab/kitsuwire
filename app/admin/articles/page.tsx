import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Admin Articles", robots: { index: false, follow: false } };

export default async function AdminArticlesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const articles = await db.article.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true, author: true, tags: true } });
  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">CONTENT</p><h1>Articles</h1></div><button disabled>+ New article</button></header><section className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Updated</th><th>Tags</th></tr></thead><tbody>{articles.map(article=><tr key={article.id}><td><strong>{article.title}</strong><small>/{article.slug}</small></td><td>{article.category.label}</td><td><span className={`admin-status status-${article.status.toLowerCase()}`}>{article.status}</span></td><td>{article.updatedAt.toLocaleDateString("en-GB")}</td><td>{article.tags.slice(0,3).map(tag=>tag.name).join(", ") || "—"}</td></tr>)}</tbody></table></section><p className="admin-note">Editing, preview, scheduling and bulk actions are the next CMS step.</p></main>;
}
