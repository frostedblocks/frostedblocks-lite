"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import {
  createCirclePost,
  joinCircle,
  loadCircle,
  loadCirclePosts,
  type CircleDetail,
} from "@/lib/circles-client";
import { publicName } from "@/lib/public";
import type { IcePost } from "@/lib/types";

export function CircleRoom({ slug }: { slug: string }) {
  const { signedIn, ready, user } = useAuth();
  const search = useSearchParams();
  const invite = search.get("i") || "";
  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function refresh() {
    setError("");
    try {
      const c = await loadCircle(slug, invite || undefined);
      setCircle(c);
      if (c.member) {
        setPosts(await loadCirclePosts(slug));
      } else {
        setPosts([]);
      }
    } catch (err) {
      setCircle(null);
      setError(err instanceof Error ? err.message : "Could not open circle.");
    }
  }

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, slug, invite, signedIn]);

  async function join() {
    setBusy(true);
    setError("");
    try {
      await joinCircle(slug, invite);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join.");
    } finally {
      setBusy(false);
    }
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createCirclePost(slug, text);
      setText("");
      setPosts(await loadCirclePosts(slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post.");
    }
  }

  async function copyInvite() {
    if (!circle?.invitePath) return;
    const url = `${window.location.origin}${circle.invitePath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this invite link", url);
    }
  }

  if (!ready) return null;

  if (!circle && error) {
    return (
      <article className="glass page-card">
        <div className="kicker">Circle</div>
        <h1 style={{ fontSize: 40 }}>Can’t open this room</h1>
        <p className="error">{error}</p>
        <p style={{ marginTop: 16 }}>
          <Link className="btn ghost" href="/circles">Your circles</Link>
        </p>
      </article>
    );
  }

  if (!circle) return null;

  if (!signedIn) {
    return (
      <article className="glass page-card">
        <div className="kicker">Join this circle</div>
        <h1 style={{ fontSize: 40 }}>{circle.name}</h1>
        <p className="lead">Sign in with email to join this private room. Posts stay out of the public feed.</p>
        <p style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn" href={`/signin?next=${encodeURIComponent(`/c/${slug}${invite ? `?i=${invite}` : ""}`)}`}>Sign in</Link>
          <Link className="btn ghost" href="/signup">Create account</Link>
        </p>
      </article>
    );
  }

  if (!circle.member) {
    return (
      <article className="glass page-card">
        <div className="kicker">Join this circle</div>
        <h1 style={{ fontSize: 40 }}>{circle.name}</h1>
        <p className="lead">You’re invited. Join to see posts and write in this room only.</p>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="button" disabled={busy || !circle.canJoin} onClick={() => { void join(); }}>
          {busy ? "Joining…" : "Join this circle"}
        </button>
        {!invite ? <p className="note">This link is missing the invite token. Ask the owner for the full guest link.</p> : null}
      </article>
    );
  }

  return (
    <article className="glass" style={{ padding: 22, maxWidth: 720, margin: "0 auto" }}>
      <div className="kicker">Private circle</div>
      <h1 style={{ fontSize: 36, margin: "4px 0 8px" }}>{circle.name}</h1>
      <p className="note" style={{ marginTop: 0 }}>
        Members only — never the public feed. (Not end-to-end encrypted yet.)
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Link className="btn ghost" href="/circles">All circles</Link>
        {circle.invitePath ? (
          <button className="btn ghost" type="button" onClick={() => { void copyInvite(); }}>
            {copied ? "Invite copied" : "Copy guest link"}
          </button>
        ) : null}
      </div>

      <form className="compose" onSubmit={publish}>
        <div className="chips" style={{ margin: "0 0 8px" }} aria-label="Post destination">
          <span className="btn" style={{ pointerEvents: "none" }}>
            Circle · {circle.name}
          </span>
        </div>
        <div className="meta">Post as {user?.name || "you"} in this circle only</div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write to this circle…" rows={4} maxLength={2000} />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">Post to circle</button>
        <p className="note" style={{ marginBottom: 0 }}>
          <Link className="quiet-link" href="/feed">Public feed</Link>
        </p>
      </form>

      <div className="feed" style={{ marginTop: 12 }}>
        {posts.map((p) => (
          <div key={p.id} className="glass post">
            <div className="post-top">
              <div className="avatar">{publicName(p.authorName).slice(0, 1).toUpperCase()}</div>
              <div>
                <b>{publicName(p.authorName)}</b>
                <div className="meta">Circle only</div>
              </div>
            </div>
            <p>{p.content}</p>
          </div>
        ))}
        {!posts.length ? <p className="note" style={{ padding: 12 }}>No posts yet. Say hello to the room.</p> : null}
      </div>

      <div className="glass stack-item" style={{ marginTop: 18 }}>
        <strong>Claim on ICE Network</strong>
        <p className="note">
          Claim on ICE Network — own this room on a canister. New Network accounts: 5 ICP one-time Join.
          Friends can stay on guest links. Does not dump history into the public ICE stream.
        </p>
        <button className="btn ghost" type="button" disabled>
          Coming soon
        </button>
      </div>
    </article>
  );
}
