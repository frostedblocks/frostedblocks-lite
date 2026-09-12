import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">Legal</div>
        <h1 style={{ fontSize: 42 }}>Privacy</h1>
        <p className="lead">ICE Lite stores only what the site needs to run.</p>
        <p className="note" style={{ marginTop: 0 }}>
          Effective September 10, 2026. Last updated September 12, 2026.
        </p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>What we keep</strong>
            <p className="note">
              New accounts use email (or Google). We store email, name, hashed password, posts, follows,
              messages, and optional profile photo. Older phone-only accounts may still have a phone on
              file. Other people see your name, not your email or phone.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Where it lives</strong>
            <p className="note">
              Account data and posts in Postgres (Neon) on Vercel. Photos on Cloudflare R2. Confirm and
              reset emails via Resend. Google OAuth when you choose Continue with Google. Lite profile
              data is not stored on ICE Network canisters.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Processors we use</strong>
            <p className="note" style={{ marginBottom: 8 }}>
              These companies process data for us so Lite can run. They are not buyers of your data.
            </p>
            <ul className="note" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55 }}>
              <li>
                <strong>Vercel</strong> — hosts the Lite website and API.
              </li>
              <li>
                <strong>Neon</strong> — Postgres database for accounts, posts, follows, and messages.
              </li>
              <li>
                <strong>Resend</strong> — sends confirmation, password reset, and account emails.
              </li>
              <li>
                <strong>Cloudflare R2</strong> — stores optional profile photos.
              </li>
              <li>
                <strong>Google</strong> — optional sign-in (OAuth). Google’s own privacy policy applies to
                that step.
              </li>
            </ul>
          </div>
          <div className="glass stack-item">
            <strong>Cookies & browser storage</strong>
            <p className="note">
              One HttpOnly sign-in cookie (`ice_lite_session`) keeps you logged in for seven days. It is
              not readable by page scripts. We do not keep your email or phone in localStorage — the
              signed-in UI reads the session cookie through the Lite API. Ads later may add their own
              cookies.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Retention</strong>
            <p className="note">
              Account data stays until you delete it. You can wipe your Lite account anytime from{" "}
              <Link href="/settings">Settings</Link> (posts, follows, messages, photo, and login). You can
              also reach us on the <Link href="/contact">contact page</Link>. Sign-out everywhere drops
              active sessions.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Your rights</strong>
            <p className="note">
              You can request access, correction, or deletion of your data by emailing{" "}
              hello@frostedblocks.com, using Settings, or the contact form. We do not sell your data.
            </p>
          </div>
          <div className="glass stack-item">
            <strong>Contact</strong>
            <p className="note">
              Questions about this policy: hello@frostedblocks.com or the{" "}
              <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
