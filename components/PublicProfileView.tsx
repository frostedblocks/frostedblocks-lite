"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { isLiteHandle } from "@/lib/public";
import type { IcePost } from "@/lib/types";
import { PostCard } from "./PostCard";
import { LiteBadge } from "./LiteBadge";
import { FollowButton } from "./FollowButton";

type PublicProfile = {
  handle: string;
  name: string;
  avatar?: string | null;
  joined?: string | null;
  me?: boolean;
};

function joinedLabel(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const days = Math.round((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Joined today";
  if (days === 1) return "Joined yesterday";
  if (days < 14) return `Joined ${days}d ago`;
  return `Joined ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export function PublicProfileView({ handle }: { handle: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  async function refresh() {
    const h = String(handle || "").trim();
    if (!isLiteHandle(h)) {
      setMissing(true);
      setReady(true);
      return;
    }
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(h)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.profile) {
        setMissing(true);
        setProfile(null);
        setPosts([]);
      } else {
        setMissing(false);
        setProfile(data.profile as PublicProfile);
        setPosts((data.posts || []) as IcePost[]);
      }
    } catch {
      setMissing(true);
      setProfile(null);
      setPosts([]);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    setReady(false);
    void refresh();
  }, [handle]);

  if (!ready) return null;

  if (missing || !profile) {
    return (
      <article className="glass auth-card">
        <div className="kicker">Profile</div>
        <h1 style={{ fontSize: 40 }}>Not found</h1>
        <p className="lead">That Lite profile is not on ICE Lite.</p>
        <p style={{ marginTop: 20 }}>
          <Link className="btn" href="/feed">Back to feed</Link>
          {" "}
          <Link className="btn ghost" href="/network">Lite foyer</Link>
        </p>
      </article>
    );
  }

  const joined = joinedLabel(profile.joined);
  const displayName = profile.name || "Lite user";
  const photosHref = `/u/${profile.handle}/photos`;

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <div className="post-top" style={{ marginBottom: 18 }}>
        {profile.avatar ? (
          <Link
            href={photosHref}
            className="avatar-expand"
            aria-label={`View ${displayName}'s photos`}
          >
            <img
              className="avatar"
              src={profile.avatar}
              alt=""
              style={{ width: 64, height: 64, objectFit: "cover" }}
            />
          </Link>
        ) : (
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 20 }}>
            {(profile.name || "U").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <div className="kicker">Lite profile · not on-chain</div>
          <h1
            style={{
              fontSize: 36,
              margin: "4px 0",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {displayName}
            <LiteBadge size="lg" />
          </h1>
          {joined ? <div className="meta">{joined}</div> : null}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 8px" }}>
        {profile.me ? (
          <>
            <Link className="btn ghost" href="/profile">You</Link>
            <Link className="btn" href="/settings">Settings</Link>
          </>
        ) : (
          <>
            <FollowButton
              target={profile.handle}
              targetName={profile.name}
              source="lite"
              onChange={() => {
                void refresh();
              }}
            />
            <Link
              className="btn ghost"
              href={`/messages?with=${encodeURIComponent(profile.handle)}`}
            >
              Message
            </Link>
          </>
        )}
        {profile.avatar ? (
          <Link className="btn ghost" href={photosHref}>
            Photos
          </Link>
        ) : null}
      </div>

      <p className="note">Names only — no emails on public profiles.</p>

      <div className="feed-head" style={{ marginTop: 22 }}>
        <span>Lite posts</span>
        <span className="meta">{posts.length}</span>
      </div>
      {posts.length ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onChange={() => {
              void refresh();
            }}
          />
        ))
      ) : (
        <p className="note">No Lite posts yet.</p>
      )}
    </article>
  );
}
