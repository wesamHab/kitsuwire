import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  const { error } = await searchParams;
  return <main className="admin-login-page">
    <section className="admin-login-card">
      <div className="admin-brand">KITSU<span>WIRE</span></div>
      <p className="admin-kicker">CONTROL CENTER</p>
      <h1>Welcome back.</h1>
      <p>Sign in to manage content, analytics, automation and site settings.</p>
      {error ? <div className="admin-error">Email or password is incorrect.</div> : null}
      <form action="/api/admin/login" method="post" className="admin-login-form">
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button type="submit">Sign in</button>
      </form>
    </section>
  </main>;
}
