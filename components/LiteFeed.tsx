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
        <span><i className="dot" />Lite feed</span>
        <span className="meta">Web2</span>
      </div>
      {signedIn ? (
        <form className="glass compose" onSubmit={publish}>
          <div className="meta">Post as {name}</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a post…"
            rows={4}
            maxLength={2000}
          />
          {error ? <p className="error">{error}</p> : null}
          <button className="btn" type="submit">Post</button>
        </form>
      ) : (
        <div className="glass compose">
          <p className="note">Sign in with email to post on Lite.</p>
          <Link className="btn" href="/signin">Sign in to post</Link>
        </div>
      )}
      <div className="glass feed">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
