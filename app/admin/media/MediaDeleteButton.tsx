"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteMediaAction } from "./actions";

export function MediaDeleteButton({ id, disabled = false }: { id: string; disabled?: boolean }) {
  const [confirming, setConfirming] = useState(false);
  if (disabled) return <button type="button" className="admin-media-delete" disabled title="This media is used by an article"><Trash2 size={14}/></button>;
  if (!confirming) return <button type="button" className="admin-media-delete" onClick={() => setConfirming(true)} title="Delete media"><Trash2 size={14}/></button>;
  return <form action={deleteMediaAction} className="admin-media-delete-confirm">
    <input type="hidden" name="id" value={id}/>
    <button type="button" onClick={() => setConfirming(false)}>Cancel</button>
    <button type="submit">Delete</button>
  </form>;
}
