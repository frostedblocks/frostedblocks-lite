import Link from "next/link";
import { emailVerifyRequired } from "@/lib/session";

export default async function JoinPage() {
  const requireVerify = await emailVerifyRequired();
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">How to join</div>
        <h1 style={{ fontSize: 42 }}>Create a Lite account</h1>
        <p className="lead">Email signup. Post free. About a minute. No wallet.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>1. Create an account</strong>
            <p className="note">Email and an 8+ character password, or Continue with Google.</p>
          </div>
          {requireVerify ? (
            <div className="glass stack-item">
              <strong>2. Confirm email, then post free</strong>
              <p className="note">Open the link we send, then publish on the feed. No wallet required.</p>
            </div>
          ) : (
            <div className="glass stack-item">
              <strong>2. Post free</strong>
              <p className="note">Open the feed and publish. No wallet required.</p>
            </div>
          )}
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">Post free</Link>
          <Link className="btn ghost" href="/feed">Feed</Link>
        </p>
      </article>
    </main>
  );
}
