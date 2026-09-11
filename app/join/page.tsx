import Link from "next/link";

export default function JoinPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">How to join</div>
        <h1 style={{ fontSize: 42 }}>Create a Lite account</h1>
        <p className="lead">Email or phone. About a minute.</p>
        <div className="stack">
          <div className="glass stack-item"><strong>1. Create an account</strong><p className="note">Email or phone and an 8+ character password.</p></div>
          <div className="glass stack-item"><strong>2. Use the feed</strong><p className="note">Post, follow, and message.</p></div>
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">Create account</Link>
          <Link className="btn ghost" href="/feed">Feed</Link>
        </p>
      </article>
    </main>
  );
}
