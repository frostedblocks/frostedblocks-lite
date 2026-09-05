import Link from "next/link";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string; ok?: string; error?: string };
}) {
  if (searchParams.token) {
    return (
      <main className="wrap page">
        <article className="glass auth-card">
          <div className="kicker">Email</div>
          <h1 style={{ fontSize: 40 }}>Confirming</h1>
          <p className="note">Finishing…</p>
          <meta httpEquiv="refresh" content={`0;url=/api/auth/verify?token=${encodeURIComponent(searchParams.token)}`} />
        </article>
      </main>
    );
  }
  const ok = searchParams.ok === "1";
  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">Email</div>
        <h1 style={{ fontSize: 40 }}>{ok ? "Email confirmed" : "Link did not work"}</h1>
        <p className="lead">{ok ? "You can use ICE Lite with this email." : "That confirm link is old or already used. Sign in and we can send another later."}</p>
        <p style={{ marginTop: 20 }}><Link className="btn" href="/signin">Sign in</Link></p>
      </article>
    </main>
  );
}
