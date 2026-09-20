"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PostCard } from "./PostCard";
import { ReferralPromoAd } from "./ReferralPromoAd";
import { currentUser, MAIL_FAILED_KEY, refreshSession } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { createPost, loadFeed } from "@/lib/posts-client";
import type { IcePost } from "@/lib/types";

const PAGE_SIZE = 10;

export function LiteFeed() {
  const { ready, signedIn, verified, hasEmail } = useAuth();
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [mailFailed, setMailFailed] = useState(false);
  const [page, setPage] = useState(0);

  async function refresh() {
    setPosts(await loadFeed());
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(MAIL_FAILED_KEY) === "1") {
      setMailFailed(true);
      sessionStorage.removeItem(MAIL_FAILED_KEY);
    }
  }, []);

  const pages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = useMemo(
    () => posts.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [posts, safePage],
  );

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!currentUser()) {
      setError("Sign in to post.");
      return;
    }
    try {
      await createPost(text);
      setText("");
      setPage(0);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post.");
    }
  }

  async function resend() {
    setError("");
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send email.");
      if (data.alreadyVerified) {
        await refreshSession();
        setSent(false);
        setMailFailed(false);
        return;
      }
      setSent(true);
      setMailFailed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send email.");
    }
  }

  if (!ready) return null;

  return (
    <div>
      <div className="feed-head">
        <span><i className="dot" />Live</span>
        <span className="meta">{posts.length} posts</span>
      </div>
      <div className="glass feed-shell">
        {signedIn && hasEmail && !verified ? (
          <div className="compose">
            <p className="note" style={{ margin: 0 }}>
              {mailFailed
                ? "Email didn’t send. Tap below, then check inbox/spam."
                : "Check your email and open the confirm link."}
            </p>
            {sent ? <p className="note">Sent. Check inbox and spam.</p> : null}
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" type="button" onClick={() => { void resend(); }}>
              Send confirm email
            </button>
          </div>
        ) : signedIn ? (
          <form className="compose" onSubmit={publish}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Post for everyone…"
              rows={3}
              maxLength={2000}
            />
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" type="submit">
              Post
            </button>
          </form>
        ) : (
          <div className="compose">
            <p className="note" style={{ margin: 0 }}>Sign in to post.</p>
            <Link className="btn" href="/signup">Create account</Link>
            <Link className="quiet-link" href="/signin">Sign in</Link>
          </div>
        )}
        <div className="feed">
          {safePage === 0 ? <ReferralPromoAd /> : null}
          {slice.map((post, i) => (
            <div key={post.id}>
              <PostCard post={post} onChange={() => { void refresh(); }} />
              {safePage === 0 && i === 2 ? <ReferralPromoAd /> : null}
            </div>
          ))}
          {!slice.length ? (
            <p className="note" style={{ padding: 12 }}>
              Nothing here yet. Be the first to post.
            </p>
          ) : null}
        </div>
        {pages > 1 ? (
          <div className="cta-row" style={{ justifyContent: "space-between", padding: "8px 10px 12px" }}>
            <button className="btn ghost" type="button" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Previous
            </button>
            <span className="meta">Page {safePage + 1} of {pages}</span>
            <button className="btn ghost" type="button" disabled={safePage >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}>
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
