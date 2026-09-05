"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { listAllMessages, listThread, listThreads, sendMessage, type LiteMessage } from "@/lib/messages-client";
import { loadPeople, type Person } from "@/lib/follow-client";

export function Messenger() {
  const { ready, signedIn } = useAuth();
  const [me, setMe] = useState("");
  const [messages, setMessages] = useState<LiteMessage[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [other, setOther] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const pack = await listAllMessages();
      setMe(pack.me);
      setMessages(pack.messages);
      setPeople(await loadPeople());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load messages.");
    }
  }

  useEffect(() => {
    if (signedIn) void refresh();
  }, [signedIn]);

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
    setError("");
    try {
      await sendMessage(me, other, text);
      setText("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    }
  }

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 760, margin: "0 auto" }}>
      <div className="kicker">ICE Lite</div>
      <h1 style={{ fontSize: 40 }}>Messages</h1>
      <p className="lead">Message by name. Emails stay private.</p>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(160px, 220px) 1fr" }}>
        <div>
          <div className="meta" style={{ marginBottom: 8 }}>People</div>
          {people.filter((p) => !p.me).map((p) => (
            <button key={p.handle} className={other === p.handle ? "btn" : "btn ghost"} style={{ width: "100%", marginBottom: 8 }} type="button" onClick={() => setOther(p.handle)}>
              {p.name}
            </button>
          ))}
          {threads.filter((t) => !people.some((p) => p.handle === t.handle)).map((t) => (
            <button key={t.handle} className={other === t.handle ? "btn" : "btn ghost"} style={{ width: "100%", marginBottom: 8 }} type="button" onClick={() => setOther(t.handle)}>
              {t.name}
            </button>
          ))}
        </div>
        <div>
          {other ? (
            <>
              <div className="meta">Thread with {otherName}</div>
              <div className="feed" style={{ maxHeight: 320, margin: "12px 0" }}>
                {thread.map((m) => (
                  <div key={m.id} className="glass" style={{ padding: 12, marginBottom: 8 }}>
                    <div className="meta">{m.from === me ? "You" : m.fromName || "Lite user"}</div>
                    <p style={{ margin: 0 }}>{m.text}</p>
                  </div>
                ))}
              </div>
              <form className="compose" onSubmit={send}>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Write a message…" />
                {error ? <p className="error">{error}</p> : null}
                <button className="btn" type="submit">Send</button>
              </form>
            </>
          ) : (
            <p className="note">Pick someone to message.</p>
          )}
        </div>
      </div>
    </article>
  );
}
