"use client";
import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";

export function ResetForm() {
  const { signedIn, ready } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
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
      await resetPassword(currentPassword, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  if (!signedIn) {
    return (
      <div className="auth-form">
        <p className="note">You must be signed in to change your password. Email reset links are not on yet.</p>
        <Link className="btn" href="/signin">Sign in</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-form">
        <p className="note">Password updated.</p>
        <Link className="btn" href="/profile">Back to profile</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Current password
        <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </label>
      <label>
        New password
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </label>
      <label>
        Confirm new password
        <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit" disabled={busy}>{busy ? "Please wait…" : "Change password"}</button>
    </form>
  );
}
