import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">ICE Lite</div>
        <h1 style={{ fontSize: 40 }}>Page not found</h1>
        <p className="lead">That page is not on ICE Lite.</p>
        <p style={{ marginTop: 18 }}>
          <Link className="btn" href="/">Home</Link>
          {" "}
          <Link className="btn ghost" href="/feed">Live feed</Link>
          {" "}
          <Link className="btn ghost" href="/network">Network</Link>
        </p>
      </article>
    </main>
  );
}
