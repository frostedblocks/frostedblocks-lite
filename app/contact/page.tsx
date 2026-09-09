import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function ContactPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">Contact</div>
        <h1 style={{ fontSize: 42 }}>Talk to Lite</h1>
        <p className="lead">This is the free website door. For a canister, use ICE Network.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>Lite</strong>
            <p className="note">https://lite.frostedblocks.com — feed, signup, and reset all stay on this host.</p>
          </div>
          <div className="glass stack-item">
            <strong>ICE Network</strong>
            <p className="note"><a href={ONCHAIN_URL} rel="noopener noreferrer">{ONCHAIN_URL}</a></p>
          </div>
        </div>
        <p style={{ marginTop: 24 }}>
          <Link className="btn" href="/signup">Create Lite account</Link>
        </p>
      </article>
    </main>
  );
}
