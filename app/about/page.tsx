import { ONCHAIN_URL } from "@/lib/canisters";
export default function AboutPage() {
  return (
    <main className="wrap page">
      <article className="glass" style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
        <div className="kicker">About</div>
        <h1 style={{ fontSize: 40 }}>What is ICE Lite?</h1>
        <p className="lead">
          ICE Lite is the Web2 door into ICE. Same quiet social idea. This site is
          not on-chain.
        </p>
        <p className="note">
          Posts on Lite live on this website. Posts on frostedblocks.com live in
          canisters. Different doors, same network name.
        </p>
        <p style={{ marginTop: 24 }}><a className="btn" href={ONCHAIN_URL}>Open ICE Network</a></p>
      </article>
    </main>
  );
}
