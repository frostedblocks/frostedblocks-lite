import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function JoinPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">How to join</div>
        <h1 style={{ fontSize: 42 }}>Start on Lite</h1>
        <p className="lead">Three steps. No wallet on this door.</p>
        <div className="stack">
          <div className="glass stack-item"><strong>1. Create an account</strong><p className="note">Email or phone and an 8+ character password.</p></div>
          <div className="glass stack-item"><strong>2. Post and follow</strong><p className="note">Use Feed, Network, and Messages while signed in.</p></div>
          <div className="glass stack-item"><strong>3. Upgrade later if you want</strong><p className="note">A canister on ICE Network is optional. Lite stays free.</p></div>
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn" href="/signup">Create account</Link>
          <a className="btn ghost" href={ONCHAIN_URL}>ICE Network</a>
        </p>
      </article>
    </main>
  );
}
