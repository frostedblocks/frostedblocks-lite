import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export default function AboutPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">About</div>
        <h1 style={{ fontSize: 42 }}>ICE Lite</h1>
        <p className="lead">
          Free social for everyday use. Sign up with email or Google. No wallet. No tokens. Lite is
          enough on its own — you do not need ICE Network to post, follow, or message here.
        </p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>Lite</strong>
            <p className="note">
              lite.frostedblocks.com — free to post. Live terms: we do not run ads on Lite. Contact{" "}
              <a href="mailto:hello@frostedblocks.com">hello@frostedblocks.com</a>.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>ICE Network (optional)</strong>
            <p className="note">
              If you later want an on-chain username on the Internet Computer and, optionally, a
              personal site, that upgrade lives at frostedblocks.com. It is optional — not required
              to use Lite.
            </p>
          </div>
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">
            Create account
          </Link>
          <Link className="btn ghost" href="/feed">
            Feed
          </Link>
          <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">
            On-chain upgrade (ICE Network)
          </a>
        </p>
      </article>
    </main>
  );
}
