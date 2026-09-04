"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { currentUser } from "@/lib/auth-client";
import { loadFeed } from "@/lib/posts-client";
import { loadFollows } from "@/lib/follow-client";
import { PostCard } from "./PostCard";
import { LiteBadge } from "./LiteBadge";
import { AvatarUpload } from "./AvatarUpload";
import type { IcePost } from "@/lib/types";
import type { LiteUser } from "@/lib/auth-client";

export function ProfileView() {
  const [user, setUser] = useState<LiteUser | null>(null);
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [ready, setReady] = useState(false);
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);

  async function refresh() {
    const u = currentUser();
    setUser(u);
    if (u) {
      const feed = await loadFeed();
      setPosts(feed.filter((p) => p.author === u.email && p.source === "lite"));
      const graph = await loadFollows();
      setFollowing(graph.following.length);
      setFollowers(graph.followers.length);
    } else {
      setPosts([]);
    }
    setReady(true);
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (!ready) return null;

  if (!user) {
    return (
      <article className="glass auth-card">
        <div className="kicker">Profile</div>
        <h1 style={{ fontSize: 40 }}>Sign in first</h1>
        <p className="lead">Your Lite profile is tied to your email or phone.</p>
        <p style={{ marginTop: 20 }}>
          <Link className="btn" href="/signin">Sign in</Link>
        </p>
      </article>
    );
  }

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <div className="post-top" style={{ marginBottom: 18 }}>
        {user.avatar ? (
          <img className="avatar" src={user.avatar} alt="" style={{ width: 64, height: 64, objectFit: "cover" }} />
        ) : (
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 20 }}>
            {(user.name || user.email).slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <div className="kicker">Lite profile · not on-chain</div>
          <h1 style={{ fontSize: 36, margin: "4px 0", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {user.name || user.email.split("@")[0]}
            <LiteBadge size="lg" />
          </h1>
          <div className="meta">{user.email}</div>
          <div className="meta" style={{ marginTop: 6 }}>
            <Link href="/network">{following} Following</Link>
            {" · "}
            <Link href="/network">{followers} Followers</Link>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 8px" }}>
        <AvatarUpload onDone={() => { void refresh(); }} />
      </div>
      <p className="note">Posts, follows, and messages now save in the ice-lite database.</p>
      <div className="feed-head" style={{ marginTop: 22 }}>
        <span>Your posts</span>
        <span className="meta">{posts.length}</span>
      </div>
      {posts.length ? (
        posts.map((post) => <PostCard key={post.id} post={post} onChange={() => { void refresh(); }} />)
      ) : (
        <p className="note">No posts yet. <Link href="/feed">Write one on the feed.</Link></p>
      )}
    </article>
  );
}
