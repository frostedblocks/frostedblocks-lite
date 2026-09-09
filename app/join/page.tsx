import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function JoinPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">How to join</div>
        <h1 style={{ fontSize: 42 }}>Create a Lite account</h1>
        <p className="lead">Email or phone. About a minute. No wallet on this door.</p>
        <div className="stack">
          <div className="glass stack-item"><strong>1. Create Lite account</strong><p className="note">Email or phone and an 8+ character password. Reset uses email if you add one.</p></div>
          <div className="glass stack-item"><strong>2. Use the live feed</strong><p className="note">Post, follow, and message. Those stay in the Lite database.</p></div>
          <div className="glass stack-item"><strong>3. Upgrade later if you want</strong><p className="note">The on-chain path is ICE Network. Lite stays free either way.</p></div>
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">Create Lite account</Link>
          <Link className="btn ghost" href="/feed">Explore the live feed</Link>
          <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">Open ICE Network</a>
        </p>
      </article>
    </main>
  );
}
