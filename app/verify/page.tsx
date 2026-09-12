import Link from "next/link";
import { redirect } from "next/navigation";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string; ok?: string; error?: string };
}) {
  // Server redirect — do not rely on <meta http-equiv=refresh> in the body
  // (unreliable in App Router / modern browsers), or confirm never hits the API.
  if (searchParams.token) {
    redirect(`/api/auth/verify?token=${encodeURIComponent(searchParams.token)}`);
  }

  const ok = searchParams.ok === "1";
  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">Email</div>
        <h1 style={{ fontSize: 40 }}>{ok ? "Email confirmed" : "Link did not work"}</h1>
        <p className="lead">
          {ok
            ? "You can post, follow, and message on ICE Lite now."
            : "That confirm link is old or already used. Sign in and tap Send confirm email on the feed."}
        </p>
        <p style={{ marginTop: 20 }}>
          <Link className="btn" href="/feed">
            Open live feed
          </Link>
        </p>
      </article>
    </main>
  );
}
