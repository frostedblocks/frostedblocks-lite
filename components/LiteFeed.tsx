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

  async function refresh() {
    setPosts(await loadFeed());
  }

  useEffect(() => {
    void refresh();
  }, []);

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
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post.");
    }
  }

  if (!ready) return null;

  return (
    <div>
      <div className="feed-head">
        <span><i className="dot" />Live feed</span>
        <span className="meta">Posts save in the Lite database</span>
      </div>
      <p className="note" style={{ margin: "0 0 10px" }}>
        {signedIn
          ? "Your Lite posts stay on this door. Public ICE Network posts can also appear here."
          : "Public preview. Create a Lite account to post. Comments stay empty until you sign in."}
      </p>
      <div className="glass" style={{ padding: 8 }}>
        {signedIn ? (
          <form className="compose" onSubmit={publish}>
            <div className="meta">Post as {user?.name || "you"}</div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a post…" rows={4} maxLength={2000} />
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" type="submit">Post</button>
          </form>
        ) : (
          <div className="compose">
            <p className="note" style={{ margin: 0 }}>Sign in to post on ICE Lite.</p>
            <Link className="btn" href="/signup">Create Lite account</Link>
            <Link className="quiet-link" href="/signin">Sign in</Link>
          </div>
        )}
        <div className="feed feed-tall">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onChange={() => { void refresh(); }} />
          ))}
        </div>
      </div>
    </div>
  );
}
