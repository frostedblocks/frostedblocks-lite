"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PostCard } from "./PostCard";
import { LiteBadge, NetworkBadge } from "./LiteBadge";
import { currentUser, MAIL_FAILED_KEY, refreshSession } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { createPost, loadFeed } from "@/lib/posts-client";
import { createCirclePost, listCircles, type CircleSummary } from "@/lib/circles-client";
import { doorForPost } from "./LiteBadge";
import type { IceDoor, IcePost } from "@/lib/types";

const PAGE_SIZE = 10;
type SourceFilter = "all" | IceDoor;
type Dest = { kind: "public" } | { kind: "circle"; slug: string; name: string };

export function LiteFeed() {
  const { user, ready, signedIn, verified, hasEmail } = useAuth();
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [mailFailed, setMailFailed] = useState(false);
  const [source, setSource] = useState<SourceFilter>("all");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(0);
  const [circles, setCircles] = useState<CircleSummary[]>([]);
  const [dest, setDest] = useState<Dest>({ kind: "public" });

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

  useEffect(() => {
    if (!signedIn || !verified) {
      setCircles([]);
      setDest({ kind: "public" });
      return;
    }
    listCircles()
      .then(setCircles)
      .catch(() => setCircles([]));
  }, [signedIn, verified]);

  const counts = useMemo(() => {
    let lite = 0;
    let network = 0;
    for (const p of posts) {
      if (doorForPost(p.author, p.id, p.source) === "lite") lite += 1;
      else network += 1;
    }
    return { lite, network, all: posts.length };
  }, [posts]);

  const bySource = useMemo(() => {
    if (source === "all") return posts;
    return posts.filter((p) => doorForPost(p.author, p.id, p.source) === source);
  }, [posts, source]);

  const categories = useMemo(() => {
    const list: string[] = [];
    for (const p of bySource) {
      const c = (p.category || "").trim();
      if (c && !list.includes(c)) list.push(c);
    }
    list.sort((a, b) => a.localeCompare(b));
    return ["All", ...list];
  }, [bySource]);

  const filtered = useMemo(() => {
    if (category === "All") return bySource;
    return bySource.filter((p) => (p.category || "") === category);
  }, [bySource, category]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function pickSource(next: SourceFilter) {
    setSource(next);
    setCategory("All");
    setPage(0);
  }

  function pickCategory(next: string) {
    setCategory(next);
    setPage(0);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!currentUser()) {
      setError("Sign in to post.");
      return;
    }
    try {
      if (dest.kind === "circle") {
        await createCirclePost(dest.slug, text);
        setText("");
        window.location.href = `/c/${dest.slug}`;
        return;
      }
      await createPost(text);
      setText("");
      setSource("all");
      setCategory("All");
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
        <span><i className="dot" />Live feed</span>
        <span className="meta">{filtered.length} posts</span>
      </div>
      <p className="note" style={{ margin: "0 0 10px" }}>
        Lite Frost before the ICE — posts from <LiteBadge /> and live <NetworkBadge /> in one feed.
        Private rooms live under <Link href="/circles">Circles</Link>.
      </p>
      <div className="chips" style={{ marginTop: 0 }} aria-label="Post source">
        <button className={source === "all" ? "btn" : "chip"} type="button" onClick={() => pickSource("all")}>
          All ({counts.all})
        </button>
        <button className={source === "lite" ? "btn" : "chip"} type="button" onClick={() => pickSource("lite")}>
          ICE Lite ({counts.lite})
        </button>
        <button className={source === "network" ? "btn" : "chip"} type="button" onClick={() => pickSource("network")}>
          ICE Network ({counts.network})
        </button>
      </div>
      <div className="chips" style={{ marginTop: 0 }} aria-label="Category">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "btn" : "chip"}
            type="button"
            onClick={() => pickCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="glass" style={{ padding: 8 }}>
        {signedIn && hasEmail && !verified ? (
          <div className="compose">
            <p className="note" style={{ margin: 0 }}>
              {mailFailed
                ? "We couldn't send the confirm email just now. Tap Send confirm email below, then check inbox and spam."
                : "Confirm your email to post, follow, or message. Open the link we sent, tap Confirm my email, or send a new link."}
            </p>
            {sent ? <p className="note">Check your inbox and spam. Open the new link, then tap Confirm my email.</p> : null}
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" type="button" onClick={() => { void resend(); }}>Send confirm email</button>
          </div>
        ) : signedIn ? (
          <form className="compose" onSubmit={publish}>
            <div className="chips" style={{ margin: "0 0 8px" }} aria-label="Post destination">
              <button
                className={dest.kind === "public" ? "btn" : "chip"}
                type="button"
                onClick={() => setDest({ kind: "public" })}
              >
                Public
              </button>
              {circles.map((c) => (
                <button
                  key={c.id}
                  className={dest.kind === "circle" && dest.slug === c.slug ? "btn" : "chip"}
                  type="button"
                  onClick={() => setDest({ kind: "circle", slug: c.slug, name: c.name })}
                >
                  {c.name}
                </button>
              ))}
              {!circles.length ? (
                <Link className="chip" href="/circles">+ Circle</Link>
              ) : null}
            </div>
            <div className="meta">
              {dest.kind === "public"
                ? `Post as ${user?.name || "you"} on the public ICE Lite feed`
                : `Post as ${user?.name || "you"} in circle “${dest.name}” (not public)`}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a post…" rows={4} maxLength={2000} />
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" type="submit">
              {dest.kind === "public" ? "Post publicly" : "Post to circle"}
            </button>
          </form>
        ) : (
          <div className="compose">
            <p className="note" style={{ margin: 0 }}>Sign in to post on ICE Lite.</p>
            <Link className="btn" href="/signup">Create Lite account</Link>
            <Link className="quiet-link" href="/signin">Sign in</Link>
          </div>
        )}
        <div className="feed">
          {slice.map((post) => (
            <PostCard key={post.id} post={post} onChange={() => { void refresh(); }} />
          ))}
          {!slice.length ? (
            <p className="note" style={{ padding: 12 }}>
              {source === "lite"
                ? "No ICE Lite posts yet. Be the first to post."
                : source === "network"
                  ? "No ICE Network posts loaded right now."
                  : "No posts in this filter."}
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
