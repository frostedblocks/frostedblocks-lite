import { LiteFeed } from "@/components/LiteFeed";
import { HomeCta } from "@/components/HomeCta";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="grid">
        <div className="glass" style={{ padding: 28 }}>
          <div className="kicker">ICE Lite · Free door</div>
          <h1><em>Quiet social,</em><br />owned by you</h1>
          <p className="lead">
            No engagement farm. No rage algorithm. Sign in with email or phone.
            Keep a Lite profile now. Move to ICE Network later if you want a canister.
          </p>
          <div className="features">
            <div className="glass feature">
              <div className="ico">◇</div>
              <strong>Live feed</strong>
              <p>Posts save in the Lite database.</p>
            </div>
            <div className="glass feature">
              <div className="ico">◉</div>
              <strong>Simple login</strong>
              <p>Email or phone. No wallet on this site.</p>
            </div>
            <div className="glass feature">
              <div className="ico">+</div>
              <strong>Your profile</strong>
              <p>Photo, follows, and messages included.</p>
            </div>
          </div>
          <HomeCta />
          <div className="chips">
            <span className="chip">Lite</span>
            <span className="chip">No algorithm</span>
            <span className="chip">Free</span>
            <span className="chip">On-chain path</span>
          </div>
          <a className="glass founder" href={ONCHAIN_URL}>
            <span>Open ICE Network</span>
            <span className="meta">Canister door</span>
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
