"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import {
  listAllMessages,
  listThread,
  listThreads,
  openThread,
  sendMessage,
  unreadForPeer,
  type LiteMessage,
  type MessageReads,
} from "@/lib/messages-client";
import { loadPeople, type Person } from "@/lib/follow-client";

export function Messenger() {
  const { ready, signedIn } = useAuth();
  const [me, setMe] = useState("");
  const [messages, setMessages] = useState<LiteMessage[]>([]);
  const [reads, setReads] = useState<MessageReads>({});
  const [people, setPeople] = useState<Person[]>([]);
  const [other, setOther] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const pack = await listAllMessages();
      setMe(pack.me);
      setMessages(pack.messages);
      setReads(pack.reads);
      setPeople(await loadPeople());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load messages.");
    }
  }

  useEffect(() => {
    if (signedIn) void refresh();
  }, [signedIn]);

  async function pick(handle: string) {
    setError("");
    setOther(handle);
    try {
      const pack = await openThread(handle);
      setMe(pack.me);
      setReads((prev) => ({ ...prev, ...pack.reads }));
      setMessages((prev) => {
        const others = prev.filter(
          (m) => !((m.from === pack.me && m.to === handle) || (m.from === handle && m.to === pack.me)),
        );
        return [...others, ...pack.messages];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open thread.");
    }
  }

  if (!ready) return null;
  if (!signedIn) {
    return (
      <article className="glass auth-card">
        <div className="kicker">Messages</div>
        <h1 style={{ fontSize: 40 }}>Sign in to message</h1>
        <p className="lead">Lite messages save in the ice-lite database. Names only — no emails on screen.</p>
        <Link className="btn" href="/signin">Sign in</Link>
      </article>
    );
  }

  const threads = listThreads(me, messages);
  const thread = other ? listThread(me, other, messages) : [];
  const otherName = people.find((p) => p.handle === other)?.name || threads.find((t) => t.handle === other)?.name || "Lite user";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!other || busy) return;
    setError("");
    setBusy(true);
    try {
      await sendMessage(me, other, text);
      setText("");
      await refresh();
      await pick(other);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="glass messenger">
      <div className="kicker">ICE Lite</div>
      <h1 style={{ fontSize: 40 }}>Messages</h1>
      <p className="lead">Message by name. Emails stay private.</p>
      <div className={`messenger-grid${other ? " has-thread" : ""}`}>
        <div className="messenger-people">
          <div className="meta" style={{ marginBottom: 8 }}>People</div>
          {people.filter((p) => !p.me).map((p) => {
            const unread = unreadForPeer(me, p.handle, messages, reads);
            return (
              <button
                key={p.handle}
                className={other === p.handle ? "btn messenger-person" : "btn ghost messenger-person"}
                type="button"
                onClick={() => { void pick(p.handle); }}
              >
                <span>{p.name}</span>
                {unread > 0 ? <span className="msg-badge">{unread > 9 ? "9+" : unread}</span> : null}
              </button>
            );
          })}
          {threads.filter((t) => !people.some((p) => p.handle === t.handle)).map((t) => {
            const unread = unreadForPeer(me, t.handle, messages, reads);
            return (
              <button
                key={t.handle}
                className={other === t.handle ? "btn messenger-person" : "btn ghost messenger-person"}
                type="button"
                onClick={() => { void pick(t.handle); }}
              >
                <span>{t.name}</span>
                {unread > 0 ? <span className="msg-badge">{unread > 9 ? "9+" : unread}</span> : null}
              </button>
            );
          })}
          {!people.some((p) => !p.me) && !threads.length ? (
            <p className="note">No one to message yet. New accounts show up here after they join.</p>
          ) : null}
        </div>
        <div className="messenger-thread">
          {other ? (
            <>
              <div className="messenger-thread-head">
                <button className="btn ghost messenger-back" type="button" onClick={() => setOther("")}>
                  Back
                </button>
                <div className="meta">Thread with {otherName}</div>
              </div>
              <div className="feed messenger-feed">
                {thread.map((m) => (
                  <div key={m.id} className="glass" style={{ padding: 12, marginBottom: 8 }}>
                    <div className="meta">{m.from === me ? "You" : m.fromName || "Lite user"}</div>
                    <p style={{ margin: 0 }}>{m.text}</p>
                  </div>
                ))}
                {!thread.length ? <p className="note">No messages yet. Say hello.</p> : null}
              </div>
              <form className="compose" onSubmit={send}>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Write a message…" />
                {error ? <p className="error">{error}</p> : null}
                <button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Send"}</button>
              </form>
            </>
          ) : (
            <p className="note messenger-pick">Pick someone to message.</p>
          )}
        </div>
      </div>
    </article>
  );
}
