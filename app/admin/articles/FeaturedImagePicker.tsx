"use client";

import Link from "next/link";
import { useState } from "react";

type MediaItem = { id: string; url: string; filename: string; altText: string | null };

export function FeaturedImagePicker({ media, initialId = "" }: { media: MediaItem[]; initialId?: string }) {
  const [selected, setSelected] = useState(initialId);
  return <div className="admin-featured-picker">
    <input type="hidden" name="featuredImageId" value={selected}/>
    <div className="admin-featured-picker-head"><div><strong>Featured image</strong><small>Used on article cards and the article hero.</small></div><Link href="/admin/media" target="_blank">Open media library</Link></div>
    <button type="button" className={`admin-featured-none${selected ? "" : " active"}`} onClick={() => setSelected("")}>Use KitsuWire artwork</button>
    {media.length ? <div className="admin-featured-grid">{media.map(item => <button type="button" key={item.id} onClick={() => setSelected(item.id)} className={selected === item.id ? "active" : ""}>
      <img src={item.url} alt={item.altText ?? item.filename}/><span>{item.filename}</span>
    </button>)}</div> : <p className="admin-note">No uploaded images yet. Add one in Media Library first.</p>}
  </div>;
}
