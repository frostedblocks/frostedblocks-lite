import Link from "next/link";
import { emailVerifyRequired } from "@/lib/session";

export default function JoinPage() {
  const requireVerify = emailVerifyRequired();
  return (
    <main className="wrap page">
      <article className="glass page-card">
        <div className="kicker">How to join</div>
        <h1 style={{ fontSize: 42 }}>Create a Lite account</h1>
        <p className="lead">Email signup. About a minute.</p>
        <div className="stack">
          <div className="glass stack-item">
            <strong>1. Create an account</strong>
            <p className="note">Email and an 8+ character password (or Continue with Google).</p>
          </div>
          {requireVerify ? (
            <div className="glass stack-item">
              <strong>2. Confirm email</strong>
              <p className="note">Tap the link we send, then post, follow, and message.</p>
            </div>
          ) : (
            <div className="glass stack-item">
              <strong>2. Make a Circle</strong>
              <p className="note">Invite friends with a guest link, then post photos.</p>
            </div>
          )}
        </div>
        <p style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn" href="/signup">Create account</Link>
          <Link className="btn ghost" href="/circles">Circles</Link>
        </p>
      </article>
    </main>
  );
}
