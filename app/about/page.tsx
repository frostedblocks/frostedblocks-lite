import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function AboutPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">About</div>
        <h1 style={{ fontSize: 42 }}>Quiet social, owned by you</h1>
        <p className="lead">ICE Lite is the free door. ICE Network is the full canister product.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>What Lite is</strong>
            <p className="note">lite.frostedblocks.com — email or phone login, posts in the Lite database, a profile you can use today.</p>
          </div>
          <div className="glass stack-item">
            <strong>How it differs from ICE Network</strong>
            <p className="note">www.frostedblocks.com is the on-chain path: your own canister. That door is optional. This site never asks for a wallet.</p>
          </div>
          <div className="glass stack-item">
            <strong>How to upgrade later</strong>
            <p className="note">Keep using Lite for free. When you want a canister, open ICE Network and continue there.</p>
          </div>
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">Try Lite free</Link>
          <Link className="btn ghost" href="/feed">Explore the live feed</Link>
          <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">Own it on ICE Network</a>
        </p>
      </article>
    </main>
  );
}
