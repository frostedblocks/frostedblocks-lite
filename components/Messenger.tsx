"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { listPublicUsers } from "@/lib/auth-client";
import { listThread, listThreads, sendMessage } from "@/lib/messages-client";
import { LiteBadge } from "./LiteBadge";

export function Messenger() {
  const { user, ready, signedIn } = useAuth();
  const [other, setOther] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to") || "";
    if (to) setOther(to.toLowerCase());
  }, []);

  const threads = useMemo(() => (user ? listThreads(user.email) : []), [user, tick]);
  const messages = useMemo(
    () => (user && other ? listThread(user.email, other) : []),
    [user, other, tick],
  );
  const people = useMemo(() => listPublicUsers().filter((p) => p.email !== user?.email), [user, tick]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) return;
    try {
      sendMessage(user.email, other, text);
      setText("");
      setTick((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    }
  }

  if (!ready) return null;

  if (!signedIn || !user) {
    return (
      <article className="glass auth-card">
        <div className="kicker">Messenger</div>
        <h1 style={{ fontSize: 40 }}>Sign in to message</h1>
        <p className="lead">Lite messages are email to email on this site. Not the ICE Network canister inbox.</p>
        <p style={{ marginTop: 18 }}><Link className="btn" href="/signin">Sign in</Link></p>
      </article>
    );
  }

  return (
    <section className="grid" style={{ gridTemplateColumns: "0.8fr 1.2fr" }}>
      <aside className="glass" style={{ padding: 16 }}>
        <div className="feed-head">
          <span>Messages</span>
          <span className="meta">Lite</span>
        </div>
        {threads.length ? (
          threads.map((t) => (
            <button
              key={t.email}
              className="glass partner"
              style={{ width: "100%", marginBottom: 8, textAlign: "left", minWidth: 0 }}
              onClick={() => setOther(t.email)}
            >
              <div>
                <b>{t.email}</b>
                <div className="meta">{t.last.text.slice(0, 42)}</div>
              </div>
            </button>
          ))
        ) : (
          <p className="note">No threads yet. Pick someone on Network.</p>
        )}
        <div className="note" style={{ marginTop: 12 }}>Lite people</div>
        {people.map((p) => (
          <button
            key={p.email}
            className="btn ghost"
            style={{ width: "100%", marginTop: 8 }}
            onClick={() => setOther(p.email)}
          >
            {p.name}
          </button>
        ))}
        <p style={{ marginTop: 14 }}><Link className="btn ghost" href="/network">Open Network</Link></p>
      </aside>
      <article className="glass" style={{ padding: 16, minHeight: 420, display: "grid", gridTemplateRows: "auto 1fr auto" }}>
        {other ? (
          <>
            <div className="feed-head">
              <span>{other} <LiteBadge /></span>
            </div>
            <div className="feed" style={{ maxHeight: 360 }}>
              {messages.map((m) => (
                <div key={m.id} className="glass post" style={{ marginLeft: m.from === user.email ? 40 : 0, marginRight: m.from === user.email ? 0 : 40 }}>
                  <div className="meta">{m.from === user.email ? "You" : m.from}</div>
                  <p>{m.text}</p>
                </div>
              ))}
              {!messages.length ? <p className="note">Start this thread.</p> : null}
            </div>
            <form className="compose" onSubmit={send} style={{ margin: 0 }}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Write a message…" />
              {error ? <p className="error">{error}</p> : null}
              <button className="btn" type="submit">Send</button>
            </form>
          </>
        ) : (
          <p className="note">Pick a Lite user to open a thread.</p>
        )}
      </article>
    </section>
  );
}
