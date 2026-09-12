import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function AboutPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">About</div>
        <h1 style={{ fontSize: 42 }}>Lite Frost before the ICE</h1>
        <p className="lead">A door to the ICE Network. ICE Lite is the free site. ICE Network is optional if you want your own canister later.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>Lite</strong>
            <p className="note">Sign in with email or phone. Post, follow, and message today.</p>
          </div>
          <div className="glass stack-item">
            <strong>Network</strong>
            <p className="note">www.frostedblocks.com is the on-chain product. You do not need it to use Lite.</p>
          </div>
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">Create account</Link>
          <Link className="btn ghost" href="/feed">Feed</Link>
          <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">ICE Network</a>
        </p>
      </article>
    </main>
  );
}
