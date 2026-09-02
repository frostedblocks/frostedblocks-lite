"use client";
import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";

export function ResetForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      resetPassword(email, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset.");
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
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      </label>
      <label>
        New password
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
      </label>
      <label>
        Confirm password
        <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it again" />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit">Reset password</button>
      <p className="note"><Link href="/signin">Back to sign in</Link></p>
    </form>
  );
}
