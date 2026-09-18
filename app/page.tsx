import { LiteFeed } from "@/components/LiteFeed";
import { HomeCta } from "@/components/HomeCta";

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="glass home-hero home-hero-compact">
        <div>
          <div className="kicker">Circles</div>
          <h1 className="home-title">Share with people you know</h1>
          <p className="note" style={{ margin: "6px 0 0", maxWidth: "40ch" }}>
            Private Circle. Invite friends. Post photos.
          </p>
        </div>
        <HomeCta />
      </section>

      <section id="live-feed" className="home-feed">
        <LiteFeed />
      </section>
    </main>
  );
}
