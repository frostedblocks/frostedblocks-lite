import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ICE Lite Terms of Service — free posting product operated by Walter Wood, Delaware.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | ICE Lite",
    description: "ICE Lite Terms of Service — free posting product operated by Walter Wood, Delaware.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">Legal</div>
        <h1 style={{ fontSize: 42 }}>Terms of Service</h1>
        <p className="lead">
          ICE Lite is a free posting product. These Terms cover Lite only — not ICE Network,
          wallets, tokens, or on-chain monetization.
        </p>
        <p className="note" style={{ marginTop: 0 }}>
          Effective September 20, 2026. Operator: Walter Wood, sole proprietor, Delaware, USA.
          Brand name “Frosted Blocks” / “ICE Lite” is a trade name only — not a separate legal entity
          yet.
        </p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>Agreement</strong>
            <p className="note">
              By creating a Lite account or using lite.frostedblocks.com, you agree to these Terms
              and the <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use
              Lite.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Eligibility</strong>
            <p className="note">
              You must be at least 13 years old. If you are under 18, you may use Lite only with a
              parent or guardian’s consent where required by law. One person, one account. Provide
              accurate information and keep your password secure.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>What Lite is (and is not)</strong>
            <p className="note">
              Lite lets you create an account with email or Google, post content, and browse the
              feed without a wallet. Lite does not sell tokens, does not promise creator
              monetization, and does not store your Lite profile on ICE Network canisters. ICE
              Network is a separate product with its own terms if you choose to use it.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Your content</strong>
            <p className="note">
              You keep ownership of posts, photos, and other content you submit. You grant Walter
              Wood (operating ICE Lite) a worldwide, non-exclusive, royalty-free license to host,
              store, display, distribute, and moderate that content on Lite so the service can run.
              When you delete content or your account, we stop displaying it publicly, except for
              reasonable backup, security, legal, or abuse-prevention copies.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Acceptable use</strong>
            <p className="note">
              Do not post illegal content; harass, threaten, or impersonate others; spam or scrape
              the service; upload malware; or attempt to break security or access other people’s
              accounts. We may remove content or suspend accounts that violate these rules.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Moderation and termination</strong>
            <p className="note">
              We may refuse, remove, or restrict content or accounts at our discretion, including
              for legal, safety, or integrity reasons. You may delete your Lite account anytime in{" "}
              <Link href="/settings">Settings</Link>.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Disclaimers</strong>
            <p className="note">
              Lite is provided “as is.” We do not warrant uninterrupted or error-free service. To
              the fullest extent allowed by law, Walter Wood is not liable for indirect, incidental,
              special, consequential, or punitive damages, or for lost profits or data. Total
              liability for any claim relating to Lite is limited to the greater of (a) amounts you
              paid for Lite in the prior 12 months (currently $0 for free use) or (b) USD $100.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Governing law</strong>
            <p className="note">
              These Terms are governed by the laws of the State of Delaware, USA, without regard to
              conflict-of-law rules, unless a mandatory consumer law in your home country says
              otherwise.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Changes</strong>
            <p className="note">
              We may update these Terms. The “Effective” date above will change when we do. Continued
              use after changes means you accept the updated Terms.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Contact</strong>
            <p className="note">
              Questions: hello@frostedblocks.com or the{" "}
              <Link href="/contact">contact page</Link>. Privacy details:{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
