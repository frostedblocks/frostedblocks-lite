import { ONCHAIN_URL } from "@/lib/canisters";
export default function JoinPage() {
  return (
    <main className="wrap page">
      <article className="glass" style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
        <div className="kicker">How to join</div>
        <h1 style={{ fontSize: 40 }}>Two doors, one name</h1>
        <p className="lead">Lite is a free website. ICE Network is on-chain ownership.</p>
        <ol className="note" style={{ lineHeight: 1.7 }}>
          <li>Sign up on Lite with email. No wallet. No canister.</li>
          <li>Post on the live feed while signed in.</li>
          <li>Want a canister you own? Sign in at www.frostedblocks.com with id.ai.</li>
        </ol>
        <p style={{ marginTop: 24 }}><a className="btn" href={ONCHAIN_URL}>Open ICE Network</a></p>
      </article>
    </main>
  );
}
