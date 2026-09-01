import { AdSlot } from "@/components/AdSlot";
import { PostCard } from "@/components/PostCard";
import { ONCHAIN_URL } from "@/lib/canisters";
import { fetchRecentPosts } from "@/lib/ice";
import { SEED_FEED } from "@/lib/seed-feed";
import type { IcePost } from "@/lib/types";

async function loadFeed(): Promise<{ source: string; posts: IcePost[] }> {
  try {
    const posts = await fetchRecentPosts(16);
    if (posts.length) return { source: "ice", posts };
  } catch {
    /* fall through */
  }
  return { source: "seed", posts: SEED_FEED };
}

export default async function HomePage() {
  const { source, posts } = await loadFeed();
  return (
    <main className="wrap page">
      <section className="grid">
        <div className="glass" style={{ padding: 28 }}>
          <div className="kicker">Internet Computer · Sovereign social</div>
          <h1><em>Quiet social,</em><br />owned by you</h1>
          <p className="lead">
            Web2 entry to ICE — same quiet feed, no tokens and no Internet Identity required.
          </p>
          <div className="features">
            <div className="glass feature"><strong>Public feed</strong><p>Read on-chain posts without signing in.</p></div>
            <div className="glass feature"><strong>Web2 account</strong><p>Email signup next. No seed phrase.</p></div>
            <div className="glass feature"><strong>Your site</strong><p>Upgrade path to a personal canister.</p></div>
          </div>
          <div className="glass cta-box">
            <strong>Ready to own it?</strong>
            <p className="note">Lite stays free and ad-supported.</p>
            <a className="btn" href={ONCHAIN_URL}>Open on-chain ICE</a>
          </div>
          <div className="chips">
            <span className="chip">No tokens</span>
            <span className="chip">No algorithm</span>
            <span className="chip">Ad supported</span>
            <span className="chip">ICP upgrade</span>
          </div>
          <AdSlot label="Sidebar ad" />
        </div>
        <div>
          <div className="feed-head">
            <span><i className="dot" />{source === "ice" ? "Live on-chain feed" : "Feed preview"}</span>
            <span className="meta">{source === "ice" ? "ICE backend" : "cached sample"}</span>
          </div>
          <div className="glass feed">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </div>
      </section>
      <section className="partners">
        <div className="partners-label">PARTNERS</div>
        <div className="partner-row">
          <div className="glass partner">
            <div><b>Binance.US</b><div className="meta">Buy ICP</div></div>
            <a className="btn" href="https://www.binance.us" target="_blank" rel="noreferrer">Sign up</a>
          </div>
          <div className="glass partner">
            <div><b>Ledger</b><div className="meta">Cold wallet</div></div>
            <a className="btn" href="https://www.ledger.com" target="_blank" rel="noreferrer">Shop</a>
          </div>
        </div>
      </section>
    </main>
  );
}
