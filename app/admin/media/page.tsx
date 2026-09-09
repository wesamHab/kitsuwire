import Link from "next/link";
import { redirect } from "next/navigation";
import { Image, Upload } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { MediaDeleteButton } from "./MediaDeleteButton";

export const metadata = { title: "Admin Media", robots: { index: false, follow: false } };

export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<{ uploaded?: string; deleted?: string; error?: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const params = await searchParams;
  const media = await db.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { articles: true } } } });

  const errorMessage = params.error === "missing" ? "Choose an image first."
    : params.error === "unsupported_type" ? "Only JPEG, PNG, WebP and GIF are supported."
    : params.error === "invalid_size" ? "Images must be smaller than 8 MB."
    : params.error === "invalid_image" ? "The uploaded file is not a valid image."
    : params.error === "in-use" ? "That image is currently used by an article. Remove it from the article first."
    : params.error ? "The upload could not be completed." : null;

  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">CONTENT</p><h1>Media Library</h1></div></header>
    {params.uploaded ? <p className="admin-success">Image uploaded successfully.</p> : null}
    {params.deleted ? <p className="admin-success">Media deleted successfully.</p> : null}
    {errorMessage ? <p className="admin-error">{errorMessage}</p> : null}

    <section className="admin-panel admin-upload-panel">
      <div className="admin-panel-head"><div><p className="admin-kicker">UPLOAD</p><h2>Add image</h2></div><Upload size={20}/></div>
      <form action="/api/admin/media" method="post" encType="multipart/form-data" className="admin-upload-form">
        <label>Image<input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif" required/></label>
        <label>Alt text<input type="text" name="altText" placeholder="Describe the image for accessibility and SEO"/></label>
        <button className="admin-primary-btn" type="submit"><Upload size={15}/> Upload image</button>
      </form>
      <p className="admin-note">JPEG, PNG, WebP or GIF · maximum 8 MB. Files are stored in persistent KitsuWire media storage.</p>
    </section>

    <section className="admin-panel admin-page-panel"><div className="admin-panel-head"><div><p className="admin-kicker">LIBRARY</p><h2>{media.length} media items</h2></div><Image size={20}/></div>
    {media.length ? <div className="admin-media-grid">{media.map(item=><article key={item.id}>
      <div className="admin-media-preview">{item.kind === "IMAGE" ? <img src={item.url} alt={item.altText ?? item.filename}/> : <span>{item.kind}</span>}</div>
      <div className="admin-media-card-head"><strong>{item.filename}</strong><MediaDeleteButton id={item.id} disabled={item._count.articles > 0}/></div>
      <small>{item.altText || "No alt text"}</small>
      <small>{item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB` : "Unknown size"} · Used by {item._count.articles} article{item._count.articles === 1 ? "" : "s"}</small>
    </article>)}</div> : <div className="admin-empty"><Image size={32}/><h3>No media uploaded yet</h3><p>Upload your first article image above. It can then be selected as a featured image inside the article editor.</p></div>}
    </section>
  </main>;
}
