import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getFoxCursorEnabled } from "@/lib/site-settings";
import { setFoxCursorAction } from "../actions";

export const metadata = { title: "Admin Settings", robots: { index: false, follow: false } };

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const enabled = await getFoxCursorEnabled();
  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">SYSTEM</p><h1>Settings</h1></div></header><section className="admin-panel admin-settings-panel"><div><p className="admin-kicker">USER EXPERIENCE</p><h2>Kitsu fox cursor</h2><p className="admin-panel-copy">Enable or disable the animated fox pointer globally. This setting is stored in PostgreSQL and applies to every public visitor.</p></div><div className="admin-setting-row"><div><strong>Animated fox cursor</strong><small>{enabled ? "Enabled for visitors" : "Disabled for visitors"}</small></div><form action={setFoxCursorAction}><input type="hidden" name="enabled" value={enabled ? "false" : "true"}/><button className={enabled ? "admin-toggle on" : "admin-toggle"} type="submit"><span/></button></form></div></section></main>;
}
