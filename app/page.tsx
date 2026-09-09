import { LiteFeed } from "@/components/LiteFeed";
import { HomeCta } from "@/components/HomeCta";
import { ONCHAIN_URL } from "@/lib/canisters";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="grid home-grid">
        <div className="glass home-hero">
          <div className="kicker">ICE Lite · Free door</div>
          <h1><em>Quiet social,</em><br />owned by you</h1>
          <p className="lead">
            Post, follow, and message with a Lite profile. Email or phone. No wallet on this site.
            Upgrade later only if you want a canister on ICE Network.
          </p>
          <HomeCta />
          <div className="features">
            <div className="glass feature">
              <div className="ico">◇</div>
              <strong>Post</strong>
              <p>Writes land in the Lite database.</p>
            </div>
            <div className="glass feature">
              <div className="ico">◉</div>
              <strong>Follow</strong>
              <p>Build a quiet Lite network.</p>
            </div>
            <div className="glass feature">
              <div className="ico">+</div>
              <strong>Profile</strong>
              <p>Name, photo, and messages.</p>
            </div>
          </div>
        </div>
        <div id="live-feed">
          <LiteFeed />
        </div>
      </section>

      <section className="trust-grid">
        <div className="glass stack-item">
          <strong>What Lite is</strong>
          <p className="note">The free website door. Sign in with email or phone, keep a profile, and use the live feed.</p>
        </div>
        <div className="glass stack-item">
          <strong>How it differs from ICE Network</strong>
          <p className="note">Lite stores posts in the Lite database. ICE Network is the full product on your own canister.</p>
        </div>
        <div className="glass stack-item">
          <strong>How to upgrade later</strong>
          <p className="note">When you want a canister, open ICE Network. Lite stays here as the free door.</p>
        </div>
      </section>

      <section className="glass trust-block">
        <div className="kicker">Trust</div>
        <p className="note" style={{ marginTop: 8 }}>
          Lite is free. No tokens and no wallet on this site. Posts, follows, and messages save in the Lite database.
          Public posts from ICE Network can appear in this feed. Report problems on the <Link href="/contact">contact</Link> page.
        </p>
        <p className="note">
          Hardware wallets and exchanges live on <Link href="/partners">Resources</Link> — they are optional, not part of Lite login.
        </p>
      </section>
    </main>
  );
}
