export default function PrivacyPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">Legal</div>
        <h1 style={{ fontSize: 42 }}>Privacy</h1>
        <p className="lead">ICE Lite stores only what the site needs to run.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>What we keep</strong>
            <p className="note">Email or phone, name, hashed password, posts, follows, messages, and optional profile photo. Other people see your name, not your email.</p>
          </div>
          <div className="glass stack-item">
            <strong>Where it lives</strong>
            <p className="note">Lite database on Vercel/Postgres. Photos on Cloudflare R2. Not on ICE Network canisters.</p>
          </div>
          <div className="glass stack-item">
            <strong>Cookies</strong>
            <p className="note">One HttpOnly sign-in cookie (ice_lite_session) keeps you logged in for seven days. It is not readable by page scripts. Ads later may add their own cookies.</p>
          </div>
          <div className="glass stack-item">
            <strong>Retention</strong>
            <p className="note">Account data stays until you delete the account or ask on the contact page. Sign-out everywhere drops active sessions.</p>
          </div>
        </div>
      </article>
    </main>
  );
}
