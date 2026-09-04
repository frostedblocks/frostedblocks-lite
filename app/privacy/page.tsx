export default function PrivacyPage() {
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">Legal</div>
        <h1 style={{ fontSize: 42 }}>Privacy</h1>
        <p className="lead">ICE Lite stores the account you create so the site can work.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>What we keep</strong>
            <p className="note">Email or phone, name, hashed password, posts, follows, messages, and optional profile photo.</p>
          </div>
          <div className="glass stack-item">
            <strong>Where it lives</strong>
            <p className="note">On the Lite website database and, for photos, Cloudflare R2. Not on ICE Network canisters.</p>
          </div>
          <div className="glass stack-item">
            <strong>Cookies</strong>
            <p className="note">A sign-in cookie keeps you logged in. Ads later may use their own cookies. This page will be updated if AdSense is added.</p>
          </div>
        </div>
      </article>
    </main>
  );
}
