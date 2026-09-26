"use client";
import { useEffect, useState } from "react";
import { currentUser } from "@/lib/auth-client";
import {
  PROFILE_LINKS_CAP,
  profileLinkDisplayLabel,
  type ProfileLinkRow,
} from "@/lib/profile-links";

type Props = {
  isOwner: boolean;
  links: ProfileLinkRow[];
  cap?: number;
  onChange?: () => void;
};

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "") || url;
  } catch {
    return url;
  }
}

export function ProfileLinks({
  isOwner,
  links: initialLinks,
  cap = PROFILE_LINKS_CAP,
  onChange,
}: Props) {
  const [links, setLinks] = useState<ProfileLinkRow[]>(initialLinks);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  const atCap = links.length >= cap;
  const showSection = isOwner || links.length > 0;
  if (!showSection) return null;

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!currentUser()) throw new Error("Sign in first.");
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label, url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save link.");
      setLabel("");
      setUrl("");
      if (data.link) setLinks((prev) => [...prev, data.link as ProfileLinkRow]);
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save link.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteLink(id: string) {
    if (!window.confirm("Remove this link from your profile?")) return;
    setError("");
    setBusy(true);
    try {
      if (!currentUser()) throw new Error("Sign in first.");
      const res = await fetch(`/api/links/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not delete.");
      setLinks((prev) => prev.filter((l) => l.id !== id));
      if (editingId === id) setEditingId(null);
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(link: ProfileLinkRow) {
    setEditingId(link.id);
    setEditLabel(link.label);
    setEditUrl(link.url);
    setError("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    setBusy(true);
    try {
      if (!currentUser()) throw new Error("Sign in first.");
      const res = await fetch(`/api/links/${encodeURIComponent(editingId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label: editLabel, url: editUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update.");
      if (data.link) {
        setLinks((prev) =>
          prev.map((l) => (l.id === editingId ? (data.link as ProfileLinkRow) : l)),
        );
      }
      setEditingId(null);
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="profile-links" aria-label="Shared links">
      <div className="feed-head" style={{ marginTop: 18 }}>
        <span>Shared links</span>
        <span className="meta">
          {links.length}
          {isOwner ? ` / ${cap}` : ""}
        </span>
      </div>

      {links.length ? (
        <ul className="profile-links-list">
          {links.map((link) => {
            const title = profileLinkDisplayLabel(link.label, link.url);
            const isEditing = editingId === link.id;
            return (
              <li key={link.id} className="profile-links-item">
                {isEditing ? (
                  <form className="profile-links-form" onSubmit={saveEdit}>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Label (optional)"
                      maxLength={48}
                      disabled={busy}
                      aria-label="Link label"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://"
                      required
                      disabled={busy}
                      aria-label="Link URL"
                    />
                    <div className="profile-links-actions">
                      <button className="btn" type="submit" disabled={busy}>
                        Save
                      </button>
                      <button
                        className="btn ghost"
                        type="button"
                        disabled={busy}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <a
                      className="profile-links-anchor"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="profile-links-label">{title}</span>
                      <span className="profile-links-host meta">{hostOf(link.url)}</span>
                    </a>
                    {isOwner ? (
                      <div className="profile-links-actions">
                        <button
                          type="button"
                          className="btn ghost"
                          disabled={busy}
                          onClick={() => startEdit(link)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn ghost"
                          disabled={busy}
                          onClick={() => {
                            void deleteLink(link.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      ) : isOwner ? (
        <p className="note">No shared links yet. Add one below.</p>
      ) : null}

      {isOwner && !atCap ? (
        <form className="profile-links-form" onSubmit={addLink} style={{ marginTop: 12 }}>
          <div className="kicker" style={{ marginBottom: 6 }}>
            Add link
          </div>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional)"
            maxLength={48}
            disabled={busy}
            aria-label="New link label"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            required
            disabled={busy}
            aria-label="New link URL"
          />
          <button className="btn" type="submit" disabled={busy || !url.trim()}>
            {busy ? "Saving…" : "Add link"}
          </button>
        </form>
      ) : null}

      {isOwner && atCap ? (
        <p className="note">Link list is full ({cap}). Delete one to add another.</p>
      ) : null}

      {error ? (
        <p className="note" role="alert" style={{ color: "#fca5a5", marginTop: 8 }}>
          {error}
        </p>
      ) : null}
    </section>
  );
}
