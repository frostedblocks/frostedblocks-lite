import { AdSlot } from "@/components/AdSlot";
import { LiteFeed } from "@/components/LiteFeed";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function HomePage() {
  return (
    <main className="wrap page">
      <section className="grid">
        <div className="glass" style={{ padding: 28 }}>
          <div className="kicker">Quiet social · Web2</div>
          <h1><em>Quiet social,</em><br />owned by you</h1>
          <p className="lead">
            ICE Lite is a regular website. No blockchain, no tokens, no Internet
            Identity. Read and post here for free. Want ownership on-chain? That is
            the main ICE network, not this site.
          </p>
          <div className="features">
            <div className="glass feature"><strong>Public feed</strong><p>Hosted here. Not stored in a canister.</p></div>
            <div className="glass feature"><strong>Web2 account</strong><p>Email and password. No seed phrase.</p></div>
            <div className="glass feature"><strong>Upgrade</strong><p>Move to on-chain ICE when you want a canister.</p></div>
          </div>
          <div className="glass cta-box">
            <strong>Want it on-chain?</strong>
            <p className="note">Lite stays a free website. Ownership lives on ICE.</p>
            <a className="btn" href={ONCHAIN_URL}>Open ICE Network</a>
          </div>
          <div className="chips">
            <span className="chip">Not on-chain</span>
            <span className="chip">No tokens</span>
            <span className="chip">No algorithm</span>
            <span className="chip">Ad supported</span>
          </div>
          <AdSlot label="Ad" />
        </div>
        <LiteFeed />
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
