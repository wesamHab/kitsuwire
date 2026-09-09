import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { updateArticleAction } from "../actions";

export const metadata = { title: "Edit Article", robots: { index: false, follow: false } };

function jsonLines(value: unknown) {
  return Array.isArray(value) ? value.filter(item => typeof item === "string").join("\n") : "";
}

export default async function EditArticlePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const { saved } = await searchParams;
  const [article, categories] = await Promise.all([
    db.article.findUnique({ where: { id }, include: { category: true, tags: true } }),
    db.category.findMany({ orderBy: { title: "asc" } }),
  ]);
  if (!article) notFound();

  return <main className="admin-subpage admin-editor-page">
    <header><div><Link href="/admin/articles">← Articles</Link><p className="admin-kicker">CONTENT / EDIT</p><h1>Edit article</h1></div><Link className="admin-outline-btn" href={`/article/${article.slug}`} target="_blank">Preview public page</Link></header>
    {saved ? <p className="admin-success">Changes saved successfully.</p> : null}
    <form action={updateArticleAction} className="admin-editor-form">
      <input type="hidden" name="id" value={article.id}/>
      <section className="admin-editor-main admin-panel">
        <label>Title<input name="title" required defaultValue={article.title}/></label>
        <label>Slug<input name="slug" required defaultValue={article.slug}/></label>
        <label>Excerpt<textarea name="excerpt" rows={3} defaultValue={article.excerpt}/></label>
        <label>Article body<textarea name="body" rows={16} defaultValue={jsonLines(article.body)}/></label>
        <label>Key takeaways<textarea name="keyTakeaways" rows={6} defaultValue={jsonLines(article.keyTakeaways)}/></label>
        <div className="admin-editor-grid"><label>SEO title<input name="seoTitle" defaultValue={article.seoTitle ?? ""}/></label><label>Reading time<input name="readingTime" defaultValue={article.readingTime}/></label></div>
        <label>SEO description<textarea name="seoDescription" rows={3} defaultValue={article.seoDescription ?? ""}/></label>
        <label>Tags<input name="tags" defaultValue={article.tags.map(tag => tag.name).join(", ")}/></label>
      </section>
      <aside className="admin-editor-side admin-panel">
        <label>Status<select name="status" defaultValue={article.status}><option>IDEA</option><option>DRAFT</option><option>REVIEW</option><option>APPROVED</option><option>SCHEDULED</option><option>PUBLISHED</option><option>ARCHIVED</option></select></label>
        <label>Category<select name="categoryId" defaultValue={article.categoryId}>{categories.map(category=><option value={category.id} key={category.id}>{category.title}</option>)}</select></label>
        <label>Tone<select name="tone" defaultValue={article.tone}><option value="green">Green</option><option value="blue">Blue</option><option value="violet">Violet</option><option value="orange">Orange</option></select></label>
        <label className="admin-check"><input type="checkbox" name="featured" defaultChecked={article.featured}/> Featured article</label>
        <label className="admin-check"><input type="checkbox" name="allowAds" defaultChecked={article.allowAds}/> Allow article ads</label>
        <button className="admin-primary-btn" type="submit">Save changes</button>
        <div className="admin-editor-meta"><small>Created {article.createdAt.toLocaleDateString("en-GB")}</small><small>Updated {article.updatedAt.toLocaleString("en-GB")}</small></div>
      </aside>
    </form>
  </main>;
}
