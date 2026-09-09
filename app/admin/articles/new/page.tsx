import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { createArticleAction } from "../actions";
import { StructuredContentEditor } from "../StructuredContentEditor";

export const metadata = { title: "New Article", robots: { index: false, follow: false } };

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { error } = await searchParams;
  const categories = await db.category.findMany({ orderBy: { title: "asc" } });

  return <main className="admin-subpage admin-editor-page">
    <header><div><Link href="/admin/articles">← Articles</Link><p className="admin-kicker">CONTENT / NEW</p><h1>Create article</h1></div></header>
    {error === "slug" ? <p className="admin-error">That slug already exists. Please choose another one.</p> : null}
    {error === "missing" ? <p className="admin-error">Title, slug and category are required.</p> : null}
    {error === "schedule" ? <p className="admin-error">Choose a publication date and time when using SCHEDULED.</p> : null}
    <form action={createArticleAction} className="admin-editor-form">
      <section className="admin-editor-main admin-panel">
        <label>Title<input name="title" required placeholder="Article title"/></label>
        <label>Slug<input name="slug" placeholder="auto-generated-from-title"/></label>
        <label>Excerpt<textarea name="excerpt" rows={3} placeholder="Short summary shown on cards and search results"/></label>
        <label>Opening body<textarea name="body" rows={10} placeholder="One paragraph per line"/></label>
        <label>Key takeaways<textarea name="keyTakeaways" rows={6} placeholder="One takeaway per line"/></label>
        <div className="admin-editor-grid"><label>SEO title<input name="seoTitle"/></label><label>Reading time<input name="readingTime" defaultValue="5 min"/></label></div>
        <label>SEO description<textarea name="seoDescription" rows={3}/></label>
        <label>Tags<input name="tags" placeholder="AI, Cloud, Kubernetes"/></label>
        <StructuredContentEditor/>
      </section>
      <aside className="admin-editor-side admin-panel">
        <label>Status<select name="status" defaultValue="DRAFT"><option>IDEA</option><option>DRAFT</option><option>REVIEW</option><option>APPROVED</option><option>SCHEDULED</option><option>PUBLISHED</option><option>ARCHIVED</option></select></label>
        <label>Schedule publication<input type="datetime-local" name="scheduledAt"/><small>Required when status is SCHEDULED.</small></label>
        <label>Category<select name="categoryId" required>{categories.map(category=><option value={category.id} key={category.id}>{category.title}</option>)}</select></label>
        <label>Tone<select name="tone" defaultValue="green"><option value="green">Green</option><option value="blue">Blue</option><option value="violet">Violet</option><option value="orange">Orange</option></select></label>
        <label className="admin-check"><input type="checkbox" name="featured"/> Featured article</label>
        <label className="admin-check"><input type="checkbox" name="allowAds" defaultChecked/> Allow article ads</label>
        <button className="admin-primary-btn" type="submit">Create article</button>
      </aside>
    </form>
  </main>;
}
