import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

function errorMessage(error?: string) {
  if (error === "rate") return "Too many failed sign-in attempts. Please wait a few minutes and try again.";
  if (error === "request") return "This sign-in request was blocked for security reasons. Reload the page and try again.";
  if (error) return "Email or password is incorrect.";
  return null;
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  const { error } = await searchParams;
  const message = errorMessage(error);
  return <main className="admin-login-page">
    <section className="admin-login-card">
      <div className="admin-brand">KITSU<span>WIRE</span></div>
      <p className="admin-kicker">CONTROL CENTER</p>
      <h1>Welcome back.</h1>
      <p>Sign in to manage content, analytics, automation and site settings.</p>
      {message ? <div className="admin-error" role="alert">{message}</div> : null}
      <form action="/api/admin/login" method="post" className="admin-login-form">
        <label>Email<input name="email" type="email" autoComplete="username" maxLength={254} required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" maxLength={512} required /></label>
        <button type="submit">Sign in</button>
      </form>
    </section>
  </main>;
}
