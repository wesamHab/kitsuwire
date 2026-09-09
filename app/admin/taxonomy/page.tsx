import Link from "next/link";
import { redirect } from "next/navigation";
import { Tags } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { createTagAction, deleteTagAction, renameTagAction, updateCategoryAction } from "./actions";

export const metadata = { title: "Admin Taxonomy", robots: { index: false, follow: false } };

export default async function TaxonomyPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const params = await searchParams;
  const [categories, tags] = await Promise.all([
    db.category.findMany({ include: { _count: { select: { articles: true } } }, orderBy: { title: "asc" } }),
    db.tag.findMany({ include: { _count: { select: { articles: true } } }, orderBy: [{ articles: { _count: "desc" } }, { name: "asc" }] }),
  ]);

  return <main className="admin-subpage">
    <header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">CONTENT</p><h1>Categories & Tags</h1></div><Tags size={24}/></header>
    {params.saved ? <p className="admin-success">Changes saved.</p> : null}
    {params.deleted ? <p className="admin-success">Unused tag deleted.</p> : null}
    {params.error === "tag-in-use" ? <p className="admin-error">This tag is still used by one or more articles. Remove it from those articles first.</p> : null}
    {params.error === "duplicate-tag" ? <p className="admin-error">A tag with that name or slug already exists.</p> : null}
    {params.error === "category" || params.error === "tag" ? <p className="admin-error">Please complete all required fields.</p> : null}

    <section className="admin-panel admin-page-panel">
      <div className="admin-panel-head"><div><p className="admin-kicker">CORE CATEGORIES</p><h2>Public content categories</h2></div><span className="admin-note">{categories.length} categories</span></div>
      <p className="admin-panel-copy">Category slugs are kept stable because they are part of public URLs. You can safely change their display label, title and description here.</p>
      <div className="admin-taxonomy-grid">{categories.map(category => <form action={updateCategoryAction} className="admin-taxonomy-card" key={category.id}>
        <input type="hidden" name="id" value={category.id}/>
        <div className="admin-taxonomy-card-head"><div><span>/{category.slug}</span><strong>{category._count.articles} articles</strong></div></div>
        <label>Navigation label<input name="label" defaultValue={category.label} required/></label>
        <label>Page title<input name="title" defaultValue={category.title} required/></label>
        <label>Description<textarea name="description" rows={4} defaultValue={category.description} required/></label>
        <button type="submit" className="admin-outline-btn">Save category</button>
      </form>)}</div>
    </section>

    <section className="admin-panel admin-page-panel">
      <div className="admin-panel-head"><div><p className="admin-kicker">TAGS</p><h2>Topic vocabulary</h2></div><span className="admin-note">{tags.length} tags</span></div>
      <form action={createTagAction} className="admin-tag-create"><label>Name<input name="name" required placeholder="Platform Engineering"/></label><label>Slug<input name="slug" placeholder="platform-engineering"/></label><button className="admin-primary-btn" type="submit">Add tag</button></form>
      <div className="admin-tag-list">{tags.map(tag => <div className="admin-tag-row" key={tag.id}>
        <form action={renameTagAction} className="admin-tag-edit"><input type="hidden" name="id" value={tag.id}/><input name="name" defaultValue={tag.name} aria-label="Tag name"/><input name="slug" defaultValue={tag.slug} aria-label="Tag slug"/><span>{tag._count.articles} article{tag._count.articles === 1 ? "" : "s"}</span><button className="admin-outline-btn" type="submit">Save</button></form>
        <form action={deleteTagAction}><input type="hidden" name="id" value={tag.id}/><button className="admin-danger-btn" type="submit" disabled={tag._count.articles > 0} title={tag._count.articles > 0 ? "Remove this tag from articles before deleting it" : "Delete unused tag"}>Delete</button></form>
      </div>)}</div>
    </section>
  </main>;
}
