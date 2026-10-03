import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function AboutPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">About</div>
        <h1 style={{ fontSize: 42 }}>Post free on ICE Lite</h1>
        <p className="lead">A free social site. No wallet. ICE Network is a separate product if you want it later.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>Lite</strong>
            <p className="note">Sign up with email or Google and post on the public feed. No tokens and no ads.</p>
          </div>
          <div className="glass stack-item">
            <strong>Network</strong>
            <p className="note">frostedblocks.com is the on-chain product, with its own terms. You do not need it to use Lite.</p>
          </div>
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">Post free</Link>
          <Link className="btn ghost" href="/feed">Feed</Link>
          <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">ICE Network</a>
        </p>
      </article>
    </main>
  );
}
