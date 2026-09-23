import type { Metadata } from "next";
import { FeedTabs } from "@/components/FeedTabs";

export const metadata: Metadata = {
  title: "Feed",
  description: "Live posts on ICE Lite — free social feed.",
  alternates: { canonical: "/feed" },
  openGraph: {
    title: "Feed | ICE Lite",
    description: "Live posts on ICE Lite — free social feed.",
    url: "/feed",
  },
};

export default function FeedPage() {
  return (
    <main className="wrap page">
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="kicker" style={{ marginBottom: 8 }}>Live</div>
        <h1 style={{ fontSize: 36, marginTop: 0 }}>Feed</h1>
        <FeedTabs />
      </div>
    </main>
  );
}
