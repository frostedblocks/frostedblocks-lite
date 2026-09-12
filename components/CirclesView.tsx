"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { createCircle, listCircles, type CircleSummary } from "@/lib/circles-client";

export function CirclesView() {
  const { signedIn, ready, verified, hasEmail } = useAuth();
  const [circles, setCircles] = useState<CircleSummary[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    if (!signedIn) {
      setCircles([]);
      setLoaded(true);
      return;
    }
    try {
      setCircles(await listCircles());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load circles.");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, signedIn]);

  async function makeRoom(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const c = await createCircle(name);
      window.location.href = `/c/${c.slug}?i=${c.invitePath.split("i=")[1] || ""}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room.");
      setBusy(false);
    }
  }

  if (!ready || !loaded) {
    return (
      <article className="glass page-card" aria-busy="true">
        <div className="kicker">Circles</div>
        <h1 style={{ fontSize: 40 }}>Your rooms</h1>
        <p className="note">Loading your circles…</p>
        <div className="stack" style={{ marginTop: 18 }}>
          <div className="glass stack-item" style={{ minHeight: 56, opacity: 0.55 }} />
          <div className="glass stack-item" style={{ minHeight: 56, opacity: 0.4 }} />
          <div className="glass stack-item" style={{ minHeight: 56, opacity: 0.25 }} />
        </div>
      </article>
    );
  }

  if (!signedIn) {
    return (
      <article className="glass page-card">
        <div className="kicker">Circles</div>
        <h1 style={{ fontSize: 40 }}>Private rooms</h1>
        <p className="lead">Create a private room for 10 people. Only members can see the posts.</p>
        <p style={{ marginTop: 16 }}>
          <Link className="btn" href="/signin">Sign in to create a room</Link>
        </p>
      </article>
    );
  }

  if (hasEmail && !verified) {
    return (
      <article className="glass page-card">
        <div className="kicker">Circles</div>
        <h1 style={{ fontSize: 40 }}>Confirm email first</h1>
        <p className="lead">Confirm your email in Settings before creating or joining a circle.</p>
        <p style={{ marginTop: 16 }}>
          <Link className="btn" href="/settings">Open Settings</Link>
        </p>
      </article>
    );
  }

  return (
    <article className="glass page-card">
      <div className="kicker">Circles</div>
      <h1 style={{ fontSize: 40 }}>Your rooms</h1>
      <p className="lead">Private circles with a job — family pics, team chat, roommate board. Never lands in the public feed.</p>

      <form className="auth-form" onSubmit={makeRoom} style={{ marginTop: 18 }}>
        <label>
          Room name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Weekend crew / Apartment 4B"
            maxLength={60}
            required
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create a room for 10 people"}
        </button>
      </form>

      <div className="stack" style={{ marginTop: 22 }}>
        {circles.length ? (
          circles.map((c) => (
            <div key={c.id} className="glass stack-item" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <strong>{c.name}</strong>
                <p className="note" style={{ margin: "4px 0 0" }}>{c.owner ? "Owner" : "Member"}</p>
              </div>
              <Link className="btn ghost" href={c.invitePath}>Open</Link>
            </div>
          ))
        ) : (
          <p className="note">No circles yet. Create a room for 10 people — then share the guest link.</p>
        )}
      </div>
    </article>
  );
}
