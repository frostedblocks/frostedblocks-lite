"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";

export function ResetForm() {
  const token = useSearchParams().get("token") || "";
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
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token, password } : { currentPassword, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change password.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready && !token) return null;

  if (!token && !signedIn) {
    return (
      <div className="auth-form">
        <p className="note">Use the link from your email, or sign in first.</p>
        <Link className="btn" href="/forgot">Email me a reset link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-form">
        <p className="note">Password updated.</p>
        <Link className="btn" href="/signin">Sign in</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {!token ? (
        <label>
          Current password
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </label>
      ) : null}
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
