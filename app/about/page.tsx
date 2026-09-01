import { ONCHAIN_URL } from "@/lib/canisters";
export default function AboutPage() {
  return (
    <main className="wrap page">
      <article className="glass" style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
        <div className="kicker">Internet Computer social</div>
        <h1 style={{ fontSize: 40 }}>What is ICE Lite?</h1>
        <p className="lead">Web2 door into ICE on frostedblocks.com. Same quiet social idea, no tokens.</p>
        <p className="note">Read the public feed free. Upgrade to a personal canister on the main network when you want ownership.</p>
        <p style={{ marginTop: 24 }}><a className="btn" href={ONCHAIN_URL}>Join ICE Network ICP</a></p>
      </article>
    </main>
  );
}
