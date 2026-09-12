"use client";
import { useState } from "react";
import Link from "next/link";
import { refreshSession } from "@/lib/auth-client";

/** Tap-to-confirm — scanners prefetch GET links; they do not click this button. */
export function ConfirmEmail({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "That confirm link is old or already used.");
      }
      try {
        await refreshSession();
      } catch {
        /* feed will re-check */
      }
      window.location.replace("/verify?ok=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm that email.");
      setBusy(false);
    }
  }

  return (
    <article className="glass auth-card">
      <div className="kicker">Email</div>
      <h1 style={{ fontSize: 40 }}>Confirm your email</h1>
      <p className="lead">Tap below to finish. This step stops mail apps from using the link before you do.</p>
      {error ? <p className="error">{error}</p> : null}
      <p style={{ marginTop: 20 }}>
        <button className="btn" type="button" disabled={busy} onClick={() => { void confirm(); }}>
          {busy ? "Confirming…" : "Confirm my email"}
        </button>
      </p>
      {error ? (
        <p style={{ marginTop: 12 }}>
          <Link className="quiet-link" href="/feed">
            Back to feed to send a new link
          </Link>
        </p>
      ) : null}
    </article>
  );
}
