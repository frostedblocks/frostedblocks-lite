"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PostCard } from "./PostCard";
import { currentUser } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { createPost, loadFeed } from "@/lib/posts-client";
import type { IcePost } from "@/lib/types";

export function LiteFeed() {
  const { user, ready, signedIn } = useAuth();
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function refresh() {
    setPosts(loadFeed());
  }

  useEffect(() => {
    refresh();
  }, []);

  function publish(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!currentUser()) {
      setError("Sign in to post.");
      return;
    }
    try {
      createPost(text);
      setText("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post.");
    }
  }

  if (!ready) return null;

  return (
    <div>
      <div className="feed-head">
        <span><i className="dot" />Live feed</span>
        {signedIn ? null : <span className="meta">Public preview</span>}
      </div>
      <div className="glass" style={{ padding: 8 }}>
        {signedIn ? (
          <form className="compose" onSubmit={publish}>
            <div className="meta">Post as {user?.name || user?.email}</div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a post…" rows={4} maxLength={2000} />
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" type="submit">Post</button>
          </form>
        ) : (
          <div className="compose">
            <p className="note" style={{ margin: 0 }}>You must be signed in to post on ICE Lite.</p>
            <Link className="btn" href="/signin">Sign in to post</Link>
          </div>
        )}
        <div className="feed" style={{ maxHeight: 520 }}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onChange={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
