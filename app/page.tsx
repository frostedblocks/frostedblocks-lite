import { LiteFeed } from "@/components/LiteFeed";
import { HomeCta } from "@/components/HomeCta";

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="glass home-hero home-hero-compact">
        <div>
          <div className="kicker">ICE Lite</div>
          <h1 className="home-title">Share with people you know</h1>
          <p className="note" style={{ margin: "8px 0 0", maxWidth: "36ch" }}>
            Make a private Circle. Invite friends. Post photos. That’s it.
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
