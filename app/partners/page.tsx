import Link from "next/link";

export default function PartnersPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">Partners</div>
        <h1 style={{ fontSize: 42 }}>No partner ads on Lite</h1>
        <p className="lead">
          ICE Lite does not run advertising, affiliate offers, token sales, or wallet products.
          ICE Network is a separate site with its own terms.
        </p>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">Post free</Link>
          <Link className="btn ghost" href="/about">About Lite</Link>
        </p>
      </article>
    </main>
  );
}
