"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { clearAvatar, currentUser, setAvatar } from "@/lib/auth-client";
import { isLiteHandle } from "@/lib/public";
import { LiteBadge } from "./LiteBadge";

type PublicProfile = {
  handle: string;
  name: string;
  avatar?: string | null;
  me?: boolean;
};

type GalleryPhoto = {
  id: string;
  url: string;
  createdAt?: string | null;
  isProfile?: boolean;
};

export function PublicPhotoGallery({ handle }: { handle: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [cap, setCap] = useState(18);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const h = String(handle || "").trim();
    if (!isLiteHandle(h)) {
      setMissing(true);
      setReady(true);
      return;
    }
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(h)}/photos`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.profile) {
        setMissing(true);
        setProfile(null);
        setPhotos([]);
      } else {
        setMissing(false);
        setProfile(data.profile as PublicProfile);
        setPhotos((data.photos || []) as GalleryPhoto[]);
        if (typeof data.cap === "number") setCap(data.cap);
      }
    } catch {
      setMissing(true);
      setProfile(null);
      setPhotos([]);
    } finally {
      setReady(true);
    }
  }, [handle]);

  useEffect(() => {
    setReady(false);
    setLightboxUrl(null);
    setError("");
    void load();
  }, [load]);

  useEffect(() => {
    if (!lightboxUrl) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxUrl(null);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxUrl]);

  async function addPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      if (!currentUser()) throw new Error("Sign in first.");
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/photos", {
        method: "POST",
        body,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      if (data.avatar) setAvatar(String(data.avatar));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function setAsProfile(photo: GalleryPhoto) {
    if (photo.id === "avatar") return;
    setError("");
    setBusy(true);
    try {
      if (!currentUser()) throw new Error("Sign in first.");
      const res = await fetch(`/api/photos/${encodeURIComponent(photo.id)}/profile`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not set profile photo.");
      if (data.avatar) setAvatar(String(data.avatar));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set profile photo.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePhoto(photo: GalleryPhoto) {
    const label = photo.isProfile
      ? "Delete this photo from your gallery? It is also your profile photo."
      : "Delete this photo from your gallery?";
    if (!window.confirm(label)) return;
    setError("");
    setBusy(true);
    try {
      if (!currentUser()) throw new Error("Sign in first.");
      const res = await fetch(`/api/photos/${encodeURIComponent(photo.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not delete.");
      if (data.avatar) setAvatar(String(data.avatar));
      else clearAvatar();
      if (lightboxUrl === photo.url) setLightboxUrl(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  async function clearProfilePhoto() {
    if (!window.confirm("Clear your profile photo? Gallery photos stay.")) return;
    setError("");
    setBusy(true);
    try {
      if (!currentUser()) throw new Error("Sign in first.");
      const res = await fetch("/api/avatar", { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not clear profile photo.");
      clearAvatar();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear profile photo.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  if (missing || !profile) {
    return (
      <article className="glass auth-card">
        <div className="kicker">Photos</div>
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

  const displayName = profile.name || "Lite user";
  const profileHref = `/u/${profile.handle}`;
  const isOwner = Boolean(profile.me);
  const atCap = photos.filter((p) => p.id !== "avatar").length >= cap;

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <div className="kicker">Lite photos · not on-chain</div>
      <h1
        style={{
          fontSize: 36,
          margin: "4px 0 8px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        Photos · {displayName}
        <LiteBadge size="lg" />
      </h1>
      <p className="note" style={{ marginBottom: 18 }}>
        Names only — no emails on public galleries.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 18px" }}>
        <Link className="btn ghost" href={profileHref}>
          Back to profile
        </Link>
        {isOwner ? (
          <>
            <label
              className="btn"
              style={{ display: "inline-block", opacity: busy || atCap ? 0.55 : 1 }}
            >
              {busy ? "Working…" : atCap ? `Gallery full (${cap})` : "Add photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={busy || atCap}
                onChange={addPhoto}
              />
            </label>
            {profile.avatar ? (
              <button
                type="button"
                className="btn ghost"
                disabled={busy}
                onClick={() => void clearProfilePhoto()}
              >
                Clear profile photo
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      {isOwner && error ? (
        <p className="error" style={{ marginTop: 0, marginBottom: 14 }}>{error}</p>
      ) : null}

      {isOwner ? (
        <p className="note" style={{ marginTop: 0, marginBottom: 14 }}>
          {photos.filter((p) => p.id !== "avatar").length}/{cap} gallery photos
          {profile.avatar ? " · tap a tile to enlarge" : " · first photo becomes your profile photo"}
        </p>
      ) : null}

      {photos.length ? (
        <div className="photo-gallery-grid">
          {photos.map((photo, i) => (
            <div key={`${photo.id}-${i}`} className="photo-gallery-card">
              <button
                type="button"
                className={`photo-gallery-tile${photo.isProfile ? " is-profile" : ""}`}
                aria-label={`View photo ${i + 1} for ${displayName}`}
                onClick={() => setLightboxUrl(photo.url)}
              >
                <img src={photo.url} alt="" />
                {photo.isProfile ? (
                  <span className="photo-gallery-badge">Profile</span>
                ) : null}
              </button>
              {isOwner ? (
                <div className="photo-gallery-actions">
                  {!photo.isProfile && photo.id !== "avatar" ? (
                    <button
                      type="button"
                      className="post-action ice"
                      disabled={busy}
                      onClick={() => void setAsProfile(photo)}
                    >
                      Set as profile
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="post-action danger"
                    disabled={busy}
                    onClick={() => void deletePhoto(photo)}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass photo-gallery-empty">
          <p className="note" style={{ margin: 0 }}>
            {isOwner
              ? "No photos yet. Add a JPG, PNG, or WEBP to start your gallery."
              : "No photos yet. This Lite user has not added gallery photos."}
          </p>
          <p style={{ marginTop: 16, marginBottom: 0 }}>
            {isOwner ? (
              <label className="btn" style={{ display: "inline-block"}}>
                Add photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={busy}
                  onChange={addPhoto}
                />
              </label>
            ) : (
              <Link className="btn ghost" href={profileHref}>
                Back to profile
              </Link>
            )}
          </p>
        </div>
      )}

      {lightboxUrl ? (
        <div
          className="avatar-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${displayName}'s photo`}
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="glass avatar-lightbox-panel photo-gallery-lightbox-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn ghost avatar-lightbox-close"
              aria-label="Close photo"
              onClick={() => setLightboxUrl(null)}
            >
              Close
            </button>
            <img
              className="photo-gallery-lightbox-img"
              src={lightboxUrl}
              alt={`${displayName}'s photo`}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
