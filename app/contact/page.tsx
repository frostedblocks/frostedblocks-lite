import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function ContactPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">Contact</div>
        <h1 style={{ fontSize: 42 }}>Talk to Lite</h1>
        <p className="lead">This is the free website door. For a canister, use ICE Network.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>Lite</strong>
            <p className="note">https://lite.frostedblocks.com — feed, signup, and reset all stay on this host.</p>
          </div>
          <div className="glass stack-item">
            <strong>ICE Network</strong>
            <p className="note"><a href={ONCHAIN_URL} rel="noopener noreferrer">{ONCHAIN_URL}</a></p>
          </div>
          <div className="glass stack-item">
            <strong>Report a problem</strong>
            <p className="note">Something broken, abusive, or unsafe? Tell us here and we will look into it.</p>
            <form className="contact-form" action="mailto:hello@frostedblocks.com" method="post" encType="text/plain">
              <label className="note" htmlFor="topic">Topic</label>
              <select id="topic" name="topic" defaultValue="report">
                <option value="report">Report a problem or abuse</option>
                <option value="data">Data or privacy question</option>
                <option value="account">Account help</option>
                <option value="other">Something else</option>
              </select>
              <label className="note" htmlFor="email">Your email (optional)</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" />
              <label className="note" htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} placeholder="Describe the issue..." />
              <button className="btn" type="submit">Send report</button>
            </form>
          </div>
        </div>
        <p style={{ marginTop: 24 }}>
          <Link className="btn" href="/signup">Create Lite account</Link>
        </p>
      </article>
    </main>
  );
}
