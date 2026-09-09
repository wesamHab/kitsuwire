import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Admin Articles", robots: { index: false, follow: false } };

export default async function AdminArticlesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const articles = await db.article.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true, author: true, tags: true } });
  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">CONTENT</p><h1>Articles</h1></div><Link className="admin-primary-btn" href="/admin/articles/new"><Plus size={16}/> New article</Link></header><section className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Updated</th><th>Tags</th><th></th></tr></thead><tbody>{articles.map(article=><tr key={article.id}><td><Link className="admin-article-link" href={`/admin/articles/${article.id}`}><strong>{article.title}</strong><small>/{article.slug}</small></Link></td><td>{article.category.label}</td><td><span className={`admin-status status-${article.status.toLowerCase()}`}>{article.status}</span></td><td>{article.updatedAt.toLocaleDateString("en-GB")}</td><td>{article.tags.slice(0,3).map(tag=>tag.name).join(", ") || "—"}</td><td><Link className="admin-icon-link" href={`/admin/articles/${article.id}`} aria-label={`Edit ${article.title}`}><Pencil size={16}/></Link></td></tr>)}</tbody></table></section><p className="admin-note">Click any article to edit content, SEO, status, category, tags and publishing settings.</p></main>;
}
