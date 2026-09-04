"use client";
import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";

export function ResetForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(login, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="auth-form">
        <p className="note">Password updated. Sign in with the new one.</p>
        <Link className="btn" href="/signin">Sign in</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Email or phone
        <input required value={login} onChange={(e) => setLogin(e.target.value)} placeholder="you@email.com or 3025551234" />
      </label>
      <label>
        New password
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </label>
      <label>
        Confirm password
        <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit" disabled={busy}>{busy ? "Please wait…" : "Reset password"}</button>
      <p className="note"><Link href="/signin">Back to sign in</Link></p>
    </form>
  );
}
