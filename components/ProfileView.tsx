"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { currentUser } from "@/lib/auth-client";
import { loadFeed } from "@/lib/posts-client";
import { PostCard } from "./PostCard";
import type { IcePost } from "@/lib/types";
import type { LiteUser } from "@/lib/auth-client";

export function ProfileView() {
  const [user, setUser] = useState<LiteUser | null>(null);
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [ready, setReady] = useState(false);

  function refresh() {
    const u = currentUser();
    setUser(u);
    if (u) setPosts(loadFeed().filter((p) => p.author === u.email));
    else setPosts([]);
    setReady(true);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!ready) return null;

  if (!user) {
    return (
      <article className="glass auth-card">
        <div className="kicker">Profile</div>
        <h1 style={{ fontSize: 40 }}>Sign in first</h1>
        <p className="lead">Your Lite profile is tied to your email account.</p>
        <p style={{ marginTop: 20 }}>
          <Link className="btn" href="/signin">Sign in</Link>
        </p>
      </article>
    );
  }

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <div className="post-top" style={{ marginBottom: 18 }}>
        <div className="avatar" style={{ width: 52, height: 52, fontSize: 20 }}>
          {(user.name || user.email).slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="kicker">Lite profile · not on-chain</div>
          <h1 style={{ fontSize: 36, margin: "4px 0" }}>{user.name || user.email.split("@")[0]}</h1>
          <div className="meta">{user.email}</div>
        </div>
      </div>
      <p className="note">This profile lives on ICE Lite only. It is not an ICE Network canister.</p>
      <div className="feed-head" style={{ marginTop: 22 }}>
        <span>Your posts</span>
        <span className="meta">{posts.length}</span>
      </div>
      {posts.length ? (
        posts.map((post) => <PostCard key={post.id} post={post} onChange={refresh} />)
      ) : (
        <p className="note">No posts yet. <Link href="/">Write one on the feed.</Link></p>
      )}
    </article>
  );
}
