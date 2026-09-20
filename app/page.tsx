import { LiteFeed } from "@/components/LiteFeed";
import { HomeCta } from "@/components/HomeCta";

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="glass home-hero home-hero-compact">
        <div>
          <div className="kicker">ICE Lite</div>
          <h1 className="home-title">Free ICE Lite — post without a wallet</h1>
          <p className="note" style={{ margin: "6px 0 0", maxWidth: "44ch" }}>
            Creators graduate to ICE Network.
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
