import { LiteFeed } from "@/components/LiteFeed";
import { HomeCta } from "@/components/HomeCta";

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="glass home-hero home-hero-compact">
        <div>
          <div className="kicker">ICE Lite</div>
          <h1 className="home-title"><em>Lite Frost before the ICE,</em> a door to the ICE Network</h1>
        </div>
        <HomeCta />
      </section>

      <section id="live-feed" className="home-feed">
        <LiteFeed />
      </section>
    </main>
  );
}
