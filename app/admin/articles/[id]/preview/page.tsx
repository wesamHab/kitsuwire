import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Article Preview", robots: { index: false, follow: false } };

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export default async function AdminArticlePreview({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const article = await db.article.findUnique({
    where: { id },
    include: {
      category: true,
      author: true,
      tags: true,
      sections: { orderBy: { position: "asc" } },
      faq: { orderBy: { position: "asc" } },
      sources: { orderBy: { position: "asc" } },
    },
  });
  if (!article) notFound();

  const body = stringArray(article.body);
  const takeaways = stringArray(article.keyTakeaways);

  return <main className="admin-preview-page">
    <div className="admin-preview-bar"><div><strong>ADMIN PREVIEW</strong><span>{article.status} · not indexed</span></div><Link href={`/admin/articles/${article.id}`}>← Back to editor</Link></div>
    <article className="admin-preview-article">
      <span className="category">{article.category.label} · KITSUWIRE PREVIEW</span>
      <h1>{article.title}</h1>
      <p className="admin-preview-excerpt">{article.excerpt}</p>
      <div className="article-byline"><span>By {article.author?.name ?? "KitsuWire Editorial"}</span><span>{article.readingTime} read</span><span>Status: {article.status}</span></div>
      {article.tags.length ? <div className="article-tags">{article.tags.map(tag => <span key={tag.id}>{tag.name}</span>)}</div> : null}
      {takeaways.length ? <section className="admin-preview-takeaways"><h2>Key takeaways</h2><ul>{takeaways.map(item => <li key={item}>{item}</li>)}</ul></section> : null}
      <section className="admin-preview-content">{body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
      {article.sections.map(section => <section key={section.id} className="admin-preview-content"><h2>{section.heading}</h2>{stringArray(section.paragraphs).map((paragraph, index) => <p key={index}>{paragraph}</p>)}{stringArray(section.bullets).length ? <ul>{stringArray(section.bullets).map(item => <li key={item}>{item}</li>)}</ul> : null}</section>)}
      {article.faq.length ? <section className="admin-preview-content"><h2>FAQ</h2>{article.faq.map(item => <div key={item.id}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</section> : null}
      {article.sources.length ? <section className="admin-preview-content"><h2>Sources</h2><ul>{article.sources.map(source => <li key={source.id}>{source.label} — {source.url}</li>)}</ul></section> : null}
    </article>
  </main>;
}
