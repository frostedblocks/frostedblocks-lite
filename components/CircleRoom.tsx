"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import {
  createCirclePost,
  deleteCircle,
  joinCircle,
  leaveCircle,
  loadCircle,
  loadCirclePosts,
  type CircleDetail,
} from "@/lib/circles-client";
import { purposeMeta } from "@/lib/circle-purpose";
import { publicName } from "@/lib/public";
import type { IcePost } from "@/lib/types";

export function CircleRoom({ slug }: { slug: string }) {
  const { signedIn, ready, user } = useAuth();
  const search = useSearchParams();
  const invite = search.get("i") || "";
  const fileRef = useRef<HTMLInputElement>(null);
  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [posts, setPosts] = useState<IcePost[]>([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function refresh() {
    setError("");
    try {
      const c = await loadCircle(slug, invite || undefined);
      setCircle(c);
      if (c.member) {
        setPosts(await loadCirclePosts(slug));
      } else {
        setPosts([]);
      }
    } catch (err) {
      setCircle(null);
      setError(err instanceof Error ? err.message : "Could not open circle.");
    }
  }

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, slug, invite, signedIn]);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function join() {
    setBusy(true);
    setError("");
    try {
      await joinCircle(slug, invite);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join.");
    } finally {
      setBusy(false);
    }
  }

  function onPick(file: File | null) {
    setError("");
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Use a JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > 2_000_000) {
      setError("Photo must be under 2MB.");
      return;
    }
    setPhoto(file);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!photo && !text.trim()) {
      setError("Add a photo or write something.");
      return;
    }
    setPosting(true);
    try {
      await createCirclePost(slug, text, photo);
      setText("");
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      setPosts(await loadCirclePosts(slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post.");
    } finally {
      setPosting(false);
    }
  }

  async function copyInvite() {
    if (!circle?.invitePath) return;
    const url = `${window.location.origin}${circle.invitePath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this invite link", url);
    }
  }

  async function removeRoom() {
    if (!circle?.owner) return;
    if (
      !window.confirm(
        `Delete “${circle.name}”? This wipes the private feed and removes every member. This cannot be undone.`,
      )
    ) {
      return;
    }
    const typed = window.prompt(`Type DELETE to permanently remove “${circle.name}”.`, "");
    if (typed !== "DELETE" && typed !== circle.name) return;
    setDeleting(true);
    setError("");
    try {
      await deleteCircle(slug, typed || "DELETE");
      window.location.replace("/circles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete circle.");
      setDeleting(false);
    }
  }

  async function leaveRoom() {
    if (!circle || circle.owner) return;
    if (!window.confirm(`Leave “${circle.name}”? You can rejoin later with the guest link.`)) return;
    setLeaving(true);
    setError("");
    try {
      await leaveCircle(slug);
      window.location.replace("/circles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not leave circle.");
      setLeaving(false);
    }
  }

  if (!ready) return null;

  if (!circle && error) {
    return (
      <article className="glass page-card">
        <div className="kicker">Circle</div>
        <h1 style={{ fontSize: 40 }}>Can’t open this room</h1>
        <p className="error">{error}</p>
        <p style={{ marginTop: 16 }}>
          <Link className="btn ghost" href="/circles">Back to Circles</Link>
        </p>
      </article>
    );
  }

  if (!circle) return null;

  if (!signedIn) {
    return (
      <article className="glass page-card">
        <div className="kicker">Join this circle</div>
        <h1 style={{ fontSize: 40 }}>{circle.name}</h1>
        <p className="lead">Sign in with email to join this private room. Only members can see the posts.</p>
        <p style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn" href={`/signin?next=${encodeURIComponent(`/c/${slug}${invite ? `?i=${invite}` : ""}`)}`}>Sign in</Link>
          <Link className="btn ghost" href="/signup">Create account</Link>
        </p>
      </article>
    );
  }

  if (!circle.member) {
    return (
      <article className="glass page-card">
        <div className="kicker">Join this circle</div>
        <h1 style={{ fontSize: 40 }}>{circle.name}</h1>
        <p className="lead">You’re invited. Join to see posts and write in this room only.</p>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="button" disabled={busy || !circle.canJoin} onClick={() => { void join(); }}>
          {busy ? "Joining…" : "Join this circle"}
        </button>
        {!invite ? <p className="note">This link is missing the invite token. Ask the owner for the full guest link.</p> : null}
      </article>
    );
  }

  const members = circle.members || [];
  const job = purposeMeta(circle.purpose || undefined);
  const emptyCopy =
    job?.id === "family"
      ? "Add the first photo"
      : job?.empty || "Add the first photo";

  return (
    <article className="glass" style={{ padding: 22, maxWidth: 720, margin: "0 auto" }}>
      <div className="kicker">Private circle{job ? ` · ${job.label}` : ""}</div>
      <h1 style={{ fontSize: 36, margin: "4px 0 8px" }}>{circle.name}</h1>
      <p className="note" style={{ marginTop: 0 }}>
        Members only — never the public feed.
      </p>
      {circle.owner && circle.invitePath ? (
        <p className="note" style={{ marginTop: 0 }}>
          Share this room: tap <strong>Copy guest link</strong> and send it to friends.
        </p>
      ) : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Link className="btn ghost" href="/circles">All circles</Link>
        {circle.invitePath ? (
          <button className="btn" type="button" onClick={() => { void copyInvite(); }}>
            {copied ? "Invite copied" : "Copy guest link"}
          </button>
        ) : null}
        {circle.owner ? (
          <button className="btn ghost" type="button" disabled={deleting} onClick={() => { void removeRoom(); }}>
            {deleting ? "Deleting…" : "Delete room"}
          </button>
        ) : (
          <button className="btn ghost" type="button" disabled={leaving} onClick={() => { void leaveRoom(); }}>
            {leaving ? "Leaving…" : "Leave"}
          </button>
        )}
      </div>

      <div className="glass stack-item" style={{ marginBottom: 14 }}>
        <strong>People in this circle</strong>
        <p className="note" style={{ marginBottom: 8 }}>
          {members.length} {members.length === 1 ? "person" : "people"} — display names only.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {members.map((m) => (
            <li key={m.id} style={{ marginBottom: 4 }}>
              {m.name}
              {m.owner ? " · Owner" : m.role === "owner" ? " · Owner" : ""}
            </li>
          ))}
        </ul>
        {!members.length ? <p className="note">No members listed yet.</p> : null}
      </div>

      <form className="compose" onSubmit={publish}>
        <div className="chips" style={{ margin: "0 0 8px" }} aria-label="Post destination">
          <span className="btn" style={{ pointerEvents: "none" }}>
            Circle · {circle.name}
          </span>
        </div>
        <div className="meta">Photo as {user?.name || "you"} in this circle only</div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => onPick(e.target.files?.[0] || null)}
        />

        {preview ? (
          <div style={{ marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Selected"
              style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 16 }}
            />
            <button
              className="btn ghost"
              type="button"
              style={{ marginTop: 8 }}
              onClick={() => {
                setPhoto(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Remove photo
            </button>
          </div>
        ) : (
          <button
            className="btn"
            type="button"
            style={{ width: "100%", minHeight: 88, marginBottom: 10, fontSize: 18 }}
            onClick={() => fileRef.current?.click()}
          >
            Add photo / Camera
          </button>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Caption (optional)"
          rows={2}
          maxLength={2000}
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit" disabled={posting}>
          {posting ? "Posting…" : "Post to circle"}
        </button>
        <p className="note" style={{ marginBottom: 0 }}>
          Stays in this room — not the public feed.
        </p>
      </form>

      <div className="feed" style={{ marginTop: 12 }}>
        {posts.map((p) => (
          <div key={p.id} className="glass post">
            <div className="post-top">
              <div className="avatar">{publicName(p.authorName).slice(0, 1).toUpperCase()}</div>
              <div>
                <b>{publicName(p.authorName)}</b>
                <div className="meta">Circle only</div>
              </div>
            </div>
            {p.imageURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageURL}
                alt=""
                style={{ width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 14, marginBottom: 8 }}
              />
            ) : null}
            {p.content ? <p>{p.content}</p> : null}
          </div>
        ))}
        {!posts.length ? (
          <p className="note" style={{ padding: 12 }}>
            {emptyCopy}
          </p>
        ) : null}
      </div>

      <div className="glass stack-item" style={{ marginTop: 18 }}>
        <strong>Claim on ICE Network</strong>
        <p className="note">
          Claim on ICE Network — own this room on a canister. New Network accounts: 5 ICP one-time Join.
          Friends can stay on guest links. Does not dump history into the public ICE stream.
        </p>
        <button className="btn ghost" type="button" disabled>
          Coming soon
        </button>
      </div>
    </article>
  );
}
