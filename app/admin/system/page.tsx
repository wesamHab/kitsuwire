import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, BadgeCheck, Database, HardDrive, MailCheck, ServerCog, ShieldCheck } from "lucide-react";
import { getAdminSession } from "@/lib/admin-auth";
import { getSystemHealth } from "@/lib/system-health";

export const metadata = { title: "Admin System", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function uptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default async function AdminSystemPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const health = await getSystemHealth();
  const healthyConfig = health.config.databaseUrl && health.config.adminSessionSecret && health.config.newsletterTokenSecret;
  const newsletterReady = health.config.newsletterDeliveryMode !== "Not connected";
  const coreLaunchReady = health.database.ok && health.storage.ok && healthyConfig && health.config.legalOperatorReady;

  return <main className="admin-subpage">
    <header><div><Link href="/admin">← Dashboard</Link><p className="admin-kicker">SYSTEM</p><h1>System Health</h1></div><Activity size={24}/></header>

    <div className="admin-stat-grid">
      <article><span>PostgreSQL</span><strong>{health.database.ok ? "Online" : "Down"}</strong><small>{health.database.latencyMs} ms query latency</small></article>
      <article><span>Web process</span><strong>{uptime(health.runtime.uptimeSeconds)}</strong><small>Current process uptime</small></article>
      <article><span>Newsletter delivery</span><strong>{health.config.newsletterDeliveryMode}</strong><small>{newsletterReady ? "Confirmation mail enabled" : "Needs provider setup"}</small></article>
      <article><span>Core launch readiness</span><strong>{coreLaunchReady ? "Ready" : "Check"}</strong><small>Runtime, storage, secrets & legal</small></article>
    </div>

    <div className="admin-system-grid">
      <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">DATABASE</p><h2>PostgreSQL</h2></div><Database size={20}/></div><div className="admin-health-list"><div><span>Status</span><strong className={health.database.ok ? "health-good" : "health-bad"}>{health.database.ok ? "Connected" : "Unavailable"}</strong></div><div><span>Latency</span><strong>{health.database.latencyMs} ms</strong></div><div><span>DATABASE_URL</span><strong className={health.config.databaseUrl ? "health-good" : "health-bad"}>{health.config.databaseUrl ? "Configured" : "Missing"}</strong></div></div></section>

      <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">RUNTIME</p><h2>Next.js process</h2></div><ServerCog size={20}/></div><div className="admin-health-list"><div><span>Node.js</span><strong>{health.runtime.node}</strong></div><div><span>Environment</span><strong>{health.runtime.environment}</strong></div><div><span>Heap</span><strong>{health.runtime.heapUsedMb} / {health.runtime.heapTotalMb} MB</strong></div><div><span>Uptime</span><strong>{uptime(health.runtime.uptimeSeconds)}</strong></div></div></section>

      <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">MEDIA STORAGE</p><h2>Persistent files</h2></div><HardDrive size={20}/></div><div className="admin-health-list"><div><span>Status</span><strong className={health.storage.ok ? "health-good" : "health-bad"}>{health.storage.ok ? "Writable" : "Unavailable"}</strong></div>{health.storage.ok ? <><div><span>Disk used</span><strong>{health.storage.usedPercent}%</strong></div><div><span>Free</span><strong>{health.storage.freeGb} GB</strong></div><div><span>Total</span><strong>{health.storage.totalGb} GB</strong></div></> : null}<div><span>Path</span><code>{health.storage.path}</code></div></div></section>

      <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">SECURITY & RETENTION</p><h2>Configuration checks</h2></div><ShieldCheck size={20}/></div><div className="admin-health-list"><div><span>Admin session secret</span><strong className={health.config.adminSessionSecret ? "health-good" : "health-bad"}>{health.config.adminSessionSecret ? "Strong enough" : "Missing / too short"}</strong></div><div><span>Newsletter token secret</span><strong className={health.config.newsletterTokenSecret ? "health-good" : "health-bad"}>{health.config.newsletterTokenSecret ? "Ready" : "Missing / too short"}</strong></div><div><span>Analytics retention</span><strong>{health.config.analyticsRetentionDays} days</strong></div><div><span>Media root</span><code>{health.config.mediaRoot}</code></div></div></section>

      <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">NEWSLETTER</p><h2>Double opt-in delivery</h2></div><MailCheck size={20}/></div><div className="admin-health-list"><div><span>Active provider</span><strong className={newsletterReady ? "health-good" : "health-warn"}>{health.config.newsletterDeliveryMode}</strong></div><div><span>Brevo API key</span><strong className={health.config.brevoApiKey ? "health-good" : "health-warn"}>{health.config.brevoApiKey ? "Configured" : "Missing"}</strong></div><div><span>Brevo sender</span><strong className={health.config.brevoSender ? "health-good" : "health-warn"}>{health.config.brevoSender ? "Configured" : "Missing"}</strong></div><div><span>Webhook fallback</span><strong>{health.config.newsletterDeliveryWebhook ? "Configured" : "Off"}</strong></div><div><span>Public URL</span><code>{health.config.newsletterPublicUrl}</code></div><div><span>Subscriber storage</span><strong className="health-good">PostgreSQL</strong></div></div><p className="admin-panel-copy">Brevo is preferred when configured. The generic webhook remains available as a provider-neutral fallback.</p></section>

      <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">LAUNCH</p><h2>Production readiness</h2></div><BadgeCheck size={20}/></div><div className="admin-health-list"><div><span>Core application</span><strong className={healthyConfig && health.database.ok && health.storage.ok ? "health-good" : "health-bad"}>{healthyConfig && health.database.ok && health.storage.ok ? "Ready" : "Needs attention"}</strong></div><div><span>Imprint operator data</span><strong className={health.config.legalOperatorReady ? "health-good" : "health-bad"}>{health.config.legalOperatorReady ? "Configured" : "Required before launch"}</strong></div><div><span>Newsletter</span><strong className={newsletterReady ? "health-good" : "health-warn"}>{newsletterReady ? "Connected" : "Optional until Brevo is ready"}</strong></div><div><span>AdSense</span><strong className={health.config.adsenseConfigured ? "health-good" : "health-warn"}>{health.config.adsenseConfigured ? "Configured" : "Optional / disabled"}</strong></div></div><p className="admin-panel-copy">Nginx/TLS, firewall and off-server backup verification remain VPS-level checks and are intentionally not guessed by the application.</p></section>
    </div>

    <p className="admin-note">Use <code>deploy/PRODUCTION.md</code> for the VPS rollout, TLS, backup and launch-verification procedure.</p>
  </main>;
}
