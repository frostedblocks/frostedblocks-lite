import Link from "next/link";

export default function PartnersPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">Resources</div>
        <h1 style={{ fontSize: 42 }}>Partners</h1>
        <p className="lead">Optional tools. They are not how you sign in to Lite. Affiliate links may earn a commission.</p>
        <div className="stack">
          <a className="glass partner" href="https://www.binance.us" target="_blank" rel="noopener noreferrer">
            <div><b>Binance.US</b><div className="meta">Buy crypto if you later use ICE Network</div></div>
            <span className="btn binance">Open</span>
          </a>
          <a className="glass partner" href="https://www.ledger.com" target="_blank" rel="noopener noreferrer">
            <div><b>Ledger</b><div className="meta">Hardware wallet — not used on this site</div></div>
            <span className="btn ledger">Open</span>
          </a>
        </div>
        <p className="note" style={{ marginTop: 20 }}>
          Lite login is email or phone only. <Link href="/signup">Create Lite account</Link>
        </p>
      </article>
    </main>
  );
}
