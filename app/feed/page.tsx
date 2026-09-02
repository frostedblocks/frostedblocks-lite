import { LiteFeed } from "@/components/LiteFeed";

export default function FeedPage() {
  return (
    <main className="wrap page">
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <LiteFeed />
      </div>
    </main>
  );
}
