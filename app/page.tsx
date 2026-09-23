import type { Metadata } from "next";
import { LiteFeed } from "@/components/LiteFeed";
import { HomeCta } from "@/components/HomeCta";

export const metadata: Metadata = {
  title: { absolute: "ICE Lite | Post free" },
  description: "Free ICE Lite — post free.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ICE Lite | Post free",
    description: "Free ICE Lite — post free.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="glass home-hero home-hero-compact">
        <div>
          <div className="kicker">ICE Lite</div>
          <h1 className="home-title">Post free.</h1>
          <p className="note" style={{ margin: "6px 0 0", maxWidth: "44ch" }}>
            Email signup. Free social.
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
