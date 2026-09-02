"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PostCard } from "./PostCard";
import { currentUser } from "@/lib/auth-client";
import { createPost, loadFeed } from "@/lib/posts-client";
import type { IcePost } from "@/lib/types";

export function LiteFeed() {
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setPosts(loadFeed());
    const user = currentUser();
    setSignedIn(!!user);
    setName(user?.name || user?.email || "");
  }, []);

  function publish(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      createPost(text);
      setText("");
      setPosts(loadFeed());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post.");
    }
  }

  return (
    <div>
      <div className="feed-head">
        <span><i className="dot" />Live feed</span>
        <span className="meta">Public preview</span>
      </div>
      <div className="glass" style={{ padding: 8 }}>
        {signedIn ? (
          <form className="compose" onSubmit={publish}>
            <div className="meta">Post as {name}</div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a post…" rows={4} maxLength={2000} />
            {error ? <p className="error">{error}</p> : null}
            <button className="btn" type="submit">Post</button>
          </form>
        ) : (
          <div className="compose">
            <p className="note" style={{ margin: 0 }}>Sign in with email to post.</p>
            <Link className="btn" href="/signin">Sign in with email</Link>
          </div>
        )}
        <div className="feed" style={{ maxHeight: 520 }}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
