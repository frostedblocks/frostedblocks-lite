"use client";
import { useState } from "react";
import Link from "next/link";

export function ForgotForm() {
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send email.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send email.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="auth-form">
        <p className="note">If that email has a Lite account, a reset link is on the way. Check spam too.</p>
        <Link className="btn" href="/signin">Back to sign in</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Email
        <input required type="email" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="you@email.com" />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
      <p className="note"><Link href="/signin">Back to sign in</Link></p>
    </form>
  );
}
