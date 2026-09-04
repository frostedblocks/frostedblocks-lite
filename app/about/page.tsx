import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function AboutPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">About</div>
        <h1 style={{ fontSize: 42 }}>Two doors. One name.</h1>
        <p className="lead">
          ICE Lite is the free website. ICE Network is the on-chain version on frostedblocks.com.
        </p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>ICE Lite</strong>
            <p className="note">lite.frostedblocks.com · email or phone · posts in the Lite database · ads can live here later</p>
          </div>
          <div className="glass stack-item">
            <strong>ICE Network</strong>
            <p className="note">www.frostedblocks.com · Internet Identity · your own canister · not this site</p>
          </div>
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn" href="/signup">Join Lite</Link>
          <a className="btn ghost" href={ONCHAIN_URL}>Open ICE Network</a>
        </p>
      </article>
    </main>
  );
}
