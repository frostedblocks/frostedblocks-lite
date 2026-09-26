"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { isLiteHandle } from "@/lib/public";
import { LiteBadge } from "./LiteBadge";

type PublicProfile = {
  handle: string;
  name: string;
  avatar?: string | null;
};

export function PublicPhotoGallery({ handle }: { handle: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const h = String(handle || "").trim();
      if (!isLiteHandle(h)) {
        if (!cancelled) {
          setMissing(true);
          setReady(true);
        }
        return;
      }
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(h)}`, {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.profile) {
          setMissing(true);
          setProfile(null);
        } else {
          setMissing(false);
          setProfile(data.profile as PublicProfile);
        }
      } catch {
        if (!cancelled) {
          setMissing(true);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    setReady(false);
    setLightboxOpen(false);
    void load();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

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
  const photos = profile.avatar ? [profile.avatar] : [];
  const profileHref = `/u/${profile.handle}`;

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
      </div>

      {photos.length ? (
        <div className="photo-gallery-grid">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className="photo-gallery-tile"
              aria-label={`View photo ${i + 1} for ${displayName}`}
              onClick={() => setLightboxOpen(true)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      ) : (
        <div className="glass photo-gallery-empty">
          <p className="note" style={{ margin: 0 }}>
            No photos yet. This Lite user has not set a profile photo.
          </p>
          <p style={{ marginTop: 16, marginBottom: 0 }}>
            <Link className="btn ghost" href={profileHref}>
              Back to profile
            </Link>
          </p>
        </div>
      )}

      {lightboxOpen && profile.avatar ? (
        <div
          className="avatar-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${displayName}'s photo`}
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="glass avatar-lightbox-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn ghost avatar-lightbox-close"
              aria-label="Close photo"
              onClick={() => setLightboxOpen(false)}
            >
              Close
            </button>
            <img
              className="avatar-lightbox-img"
              src={profile.avatar}
              alt={`${displayName}'s photo`}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
