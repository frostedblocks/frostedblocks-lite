import { LiteFeed } from "@/components/LiteFeed";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="grid">
        <div className="glass" style={{ padding: 28 }}>
          <div className="kicker">Internet Computer · Sovereign social</div>
          <h1><em>Quiet social,</em><br />owned by you</h1>
          <p className="lead">
            A quiet social network — no engagement farms, no algorithm feeding you rage.
            ICE Lite is the free website door. Sign in with email. Keep your presence.
            Want it on-chain? That is ICE Network.
          </p>
          <div className="features">
            <div className="glass feature">
              <div className="ico">◇</div>
              <strong>Public posts</strong>
              <p>Your feed lives on this site, not a silo.</p>
            </div>
            <div className="glass feature">
              <div className="ico">◉</div>
              <strong>Email login</strong>
              <p>Password login — no email harvest on-chain.</p>
            </div>
            <div className="glass feature">
              <div className="ico">+</div>
              <strong>Your profile</strong>
              <p>A Lite profile now. Canister later if you want.</p>
            </div>
          </div>
          <div className="glass cta-box">
            <strong>Ready to enter?</strong>
            <p className="note">Sign in with email. No wallet popups on this site.</p>
            <a className="btn" href="/signin">Sign in with email</a>
          </div>
          <div className="chips">
            <span className="chip">Lite</span>
            <span className="chip">No algorithm</span>
            <span className="chip">Email login</span>
            <span className="chip">Free</span>
            <span className="chip">Censorship-resistant path</span>
          </div>
          <a className="glass founder" href={ONCHAIN_URL}>
            <span>Open ICE Network</span>
            <span className="meta">On-chain door</span>
          </a>
        </div>
        <LiteFeed />
      </section>
      <section className="partners">
        <div className="partners-label">PARTNERS</div>
        <div className="partner-row">
          <a className="glass partner" href="https://www.binance.us" target="_blank" rel="noreferrer">
            <div><b>Binance.US</b><div className="meta">Buy ICP · crypto</div></div>
            <span className="btn binance">Sign up</span>
          </a>
          <a className="glass partner" href="https://www.ledger.com" target="_blank" rel="noreferrer">
            <div><b>Ledger</b><div className="meta">Cold wallet · self-custody</div></div>
            <span className="btn ledger">Shop</span>
          </a>
        </div>
      </section>
    </main>
  );
}
