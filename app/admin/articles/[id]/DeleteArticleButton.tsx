"use client";

import { useState } from "react";
import { deleteArticleAction } from "../actions";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return <button type="button" className="admin-danger-btn" onClick={() => setConfirming(true)}>Delete article</button>;
  }

  return <div className="admin-delete-confirm">
    <strong>Delete permanently?</strong>
    <small>“{title}” and its sections, FAQ, sources and revisions will be removed.</small>
    <div>
      <button type="button" className="admin-outline-btn" onClick={() => setConfirming(false)}>Cancel</button>
      <form action={deleteArticleAction}>
        <input type="hidden" name="id" value={id}/>
        <button type="submit" className="admin-danger-btn">Yes, delete</button>
      </form>
    </div>
  </div>;
}
