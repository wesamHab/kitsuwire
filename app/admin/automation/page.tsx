import Link from "next/link";
import { redirect } from "next/navigation";
import { Bot, Clock3, RefreshCw, SearchCheck, WandSparkles } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = { title: "Admin Automation", robots: { index: false, follow: false } };

const automations = [
  { icon: SearchCheck, name: "SEO health scan", status: "Manual", description: "Checks article metadata, tags and sources." },
  { icon: RefreshCw, name: "Stale content scan", status: "Planned", description: "Finds articles that may need factual or editorial updates." },
  { icon: Bot, name: "AI draft generation", status: "Planned", description: "Creates drafts for admin review; never auto-publishes by default." },
  { icon: Clock3, name: "Scheduled publishing", status: "Planned", description: "Publishes approved articles at their scheduled time." },
];

export default async function AdminAutomationPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <main className="admin-subpage"><header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">AUTOMATION</p><h1>Automation</h1></div></header>
    <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">CONTROL CENTER</p><h2>Editorial automations</h2></div><WandSparkles size={20}/></div><p className="admin-panel-copy">This route is now active. Automations will be enabled individually so AI and scheduled jobs remain under admin control.</p>
      <div className="admin-automation-grid">{automations.map(item => { const Icon = item.icon; return <article key={item.name}><Icon size={22}/><div><strong>{item.name}</strong><p>{item.description}</p></div><span>{item.status}</span></article>; })}</div>
    </section>
  </main>;
}
