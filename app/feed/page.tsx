import { FeedTabs } from "@/components/FeedTabs";

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
