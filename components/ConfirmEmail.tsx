"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { refreshSession } from "@/lib/auth-client";

/** Tap-to-confirm — scanners prefetch GET links; they do not click this button. */
export function ConfirmEmail({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((s) => {
        if (cancelled) return;
        if (s.user && s.verified) {
          window.location.replace("/feed");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
      // Hard navigate to feed so the confirm banner clears immediately.
      window.location.replace("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm that email.");
      setBusy(false);
    }
  }

  return (
    <article className="glass auth-card">
      <div className="kicker">Email</div>
      <h1 style={{ fontSize: 40 }}>One more tap</h1>
      <p className="lead">
        Mail apps often open links before you do. Tap below to finish confirming — then you can post.
      </p>
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
