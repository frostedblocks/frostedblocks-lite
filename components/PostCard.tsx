"use client";
import { avatarFor } from "@/lib/auth-client";
import { postPath, postUrl } from "@/lib/post-url";
import { deletePost } from "@/lib/posts-client";
import { createReply, deleteReply, loadReplies, type LiteReply } from "@/lib/replies-client";
import { looksLikeEmail, publicName } from "@/lib/public";
import { splitLinks } from "@/lib/text";
import type { IcePost } from "@/lib/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { doorForPost } from "./LiteBadge";
import { FollowButton } from "./FollowButton";
import { useAuth } from "@/lib/use-auth";

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
  const { signedIn } = useAuth();
  const [photo, setPhoto] = useState("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [replies, setReplies] = useState<LiteReply[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [likes, setLikes] = useState(Number(post.likes || 0));
  const [likedByMe, setLikedByMe] = useState(!!post.likedByMe);
  const [likeBusy, setLikeBusy] = useState(false);
  const door = doorForPost(post.author, post.id, post.source);
  const name = publicName(post.authorName);
  const href = postPath(post.id);
  const canFollow = door === "lite" && /^u\d+$/i.test(post.author) && !post.mine;
  const isNetwork = post.source === "network" || String(post.id).startsWith("network-");

  useEffect(() => {
    setLikes(Number(post.likes || 0));
    setLikedByMe(!!post.likedByMe);
  }, [post.id, post.likes, post.likedByMe]);

  async function toggleLike() {
    if (!signedIn) {
      window.location.href = "/signin";
      return;
    }
    if (!isNetwork || likeBusy) return;
    setLikeBusy(true);
    setError("");
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not like.");
      const liteLikes = Number(data.liteLikes ?? 0);
      const chainLikes = Math.max(0, Number(post.likes || 0) - Number(post.liteLikes || 0));
      setLikedByMe(!!data.liked);
      setLikes(chainLikes + liteLikes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not like.");
    } finally {
      setLikeBusy(false);
    }
  }

  useEffect(() => {
    setPhoto(looksLikeEmail(post.author) ? avatarFor(post.author) : "");
  }, [post.author]);

  async function refreshReplies() {
    setReplies(await loadReplies(post.id));
  }

  useEffect(() => {
    void refreshReplies();
  }, [post.id]);

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
    const url = postUrl(post.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createReply(post.id, text);
      setText("");
      await refreshReplies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reply.");
    }
  }

  return (
    <article className="glass post">
      <div className="post-top">
        {photo ? (
          <img className="avatar" src={photo} alt="" />
        ) : (
          <div className="avatar">{name.slice(0, 1).toUpperCase()}</div>
        )}
        <div>
          <b>{name}</b>
          <div className="meta">
            <Link href={href}>{when(post.timestamp)}</Link>
          </div>
        </div>
        {canFollow ? <FollowButton compact target={post.author} targetName={name} /> : null}
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
        <div className="post-stats" aria-label="Engagement">
          <span>{likes} likes</span>
          <span aria-hidden="true">·</span>
          <span>{post.loves} loves</span>
          <span aria-hidden="true">·</span>
          <span>{replies.length} replies</span>
        </div>
        <div className="post-actions">
          {isNetwork ? (
            <button
              className="post-action"
              type="button"
              disabled={likeBusy}
              onClick={() => {
                void toggleLike();
              }}
              aria-pressed={likedByMe}
            >
              {likedByMe ? "Liked" : "Like"}
            </button>
          ) : null}
          <button className="post-action" type="button" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide replies" : "Reply"}
          </button>
          <Link className="post-action" href={href}>Open</Link>
          <button className="post-action" type="button" onClick={() => { void copy(); }}>
            {copied ? "Copied" : "Copy link"}
          </button>
          {post.mine ? (
            <button className="post-action danger" type="button" onClick={() => { void remove(); }}>
              Delete
            </button>
          ) : null}
        </div>
      </div>
      {open ? (
        <div className="stack" style={{ marginTop: 12 }}>
          {replies.map((r) => (
            <div key={r.id} className="glass stack-item" style={{ padding: 12 }}>
              <div className="meta">
                {publicName(r.authorName)} · {when(r.timestamp)}
                {r.mine ? (
                  <>
                    {" · "}
                    <button
                      className="post-action danger inline"
                      type="button"
                      onClick={async () => {
                        try {
                          await deleteReply(r.id);
                          await refreshReplies();
                        } catch (err) {
                          window.alert(err instanceof Error ? err.message : "Could not delete reply.");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
              <p style={{ margin: "6px 0 0" }}>{r.content}</p>
            </div>
          ))}
          {signedIn ? (
            <form className="compose" style={{ padding: 0 }} onSubmit={sendReply}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply…" rows={3} maxLength={1000} />
              {error ? <p className="error">{error}</p> : null}
              <button className="btn" type="submit">Reply</button>
            </form>
          ) : (
            <p className="note">
              <Link href="/signin">Sign in</Link> to reply.
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}
