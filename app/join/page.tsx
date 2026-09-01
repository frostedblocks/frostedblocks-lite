import { ONCHAIN_URL } from "@/lib/canisters";
export default function JoinPage() {
  return (
    <main className="wrap page">
      <article className="glass" style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
        <div className="kicker">How to join</div>
        <h1 style={{ fontSize: 40 }}>Two doors, one network</h1>
        <p className="lead">Lite is free and ad-supported. On-chain ICE is ownership.</p>
        <ol className="note" style={{ lineHeight: 1.7 }}>
          <li>Read the public feed here. No account needed.</li>
          <li>Web2 email login comes next.</li>
          <li>Want a canister? Sign in at frostedblocks.com with id.ai.</li>
        </ol>
        <p style={{ marginTop: 24 }}><a className="btn" href={ONCHAIN_URL}>Sign in with id.ai</a></p>
      </article>
    </main>
  );
}
