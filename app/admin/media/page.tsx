import Link from "next/link";
import { redirect } from "next/navigation";
import { Image, Upload } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Admin Media", robots: { index: false, follow: false } };

export default async function AdminMediaPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const media = await db.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { articles: true } } } });
  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">CONTENT</p><h1>Media Library</h1></div><button className="admin-outline-btn" disabled><Upload size={16}/> Upload coming next</button></header>
    <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">LIBRARY</p><h2>{media.length} media items</h2></div><Image size={20}/></div>
    {media.length ? <div className="admin-media-grid">{media.map(item=><article key={item.id}><div className="admin-media-preview">{item.kind === "IMAGE" ? <Image size={28}/> : <span>{item.kind}</span>}</div><strong>{item.filename}</strong><small>{item.altText || "No alt text"}</small><small>Used by {item._count.articles} article{item._count.articles === 1 ? "" : "s"}</small></article>)}</div> : <div className="admin-empty"><Image size={32}/><h3>No media uploaded yet</h3><p>This page is now active. Upload and AI-generated media workflows will be added here without changing the route.</p></div>}
    </section>
  </main>;
}
