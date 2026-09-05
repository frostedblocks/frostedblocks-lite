"use client";
import { avatarFor, currentUser } from "@/lib/auth-client";
import { deletePost } from "@/lib/posts-client";
import { splitLinks } from "@/lib/text";
import type { IcePost } from "@/lib/types";
import { useEffect, useState } from "react";
import { DoorBadge, doorForPost } from "./LiteBadge";

function when(ts: number) {
  const ms = ts > 1e14 ? ts / 1e6 : ts;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
}

export function PostCard({ post, onChange }: { post: IcePost; onChange?: () => void }) {
  const [mine, setMine] = useState(false);
  const [photo, setPhoto] = useState("");
  const door = doorForPost(post.author, post.id, post.source);

  useEffect(() => {
    const user = currentUser();
    setMine(!!user && user.email === post.author && door === "lite");
    setPhoto(avatarFor(post.author));
  }, [post.author, door]);

  async function remove() {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(post.id);
      onChange?.();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  async function copy() {
    const url = door === "network" ? "https://www.frostedblocks.com" : `https://lite.frostedblocks.com/feed`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <article className="glass post">
      <div className="post-top">
        {photo ? (
          <img className="avatar" src={photo} alt="" />
        ) : (
          <div className="avatar">{(post.authorName || "U").slice(0, 1).toUpperCase()}</div>
        )}
        <div>
          <b>
            {post.authorName}{" "}
            <DoorBadge source={door} author={post.author} postId={post.id} />
          </b>
          <div className="meta">{when(post.timestamp)}</div>
        </div>
        {post.category ? <span className="tag">{post.category}</span> : null}
      </div>
      <p>
        {splitLinks(post.content).map((part, i) =>
          part.startsWith("http") ? (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
      <div className="post-foot">
        <span>{post.likes} likes · {post.loves} loves</span>
        <span style={{ display: "flex", gap: 10 }}>
          <button className="delete-btn" type="button" onClick={() => { void copy(); }}>Copy link</button>
          {door === "network" ? (
            <a className="delete-btn" href="https://www.frostedblocks.com" target="_blank" rel="noopener noreferrer">Open on Network</a>
          ) : null}
          {mine ? (
            <button className="delete-btn" type="button" onClick={() => { void remove(); }}>Delete</button>
          ) : null}
        </span>
      </div>
    </article>
  );
}
