"use client";
import { useState } from "react";
import { clearAvatar, currentUser, setAvatar } from "@/lib/auth-client";

export function AvatarUpload({ hasPhoto, onDone }: { hasPhoto?: boolean; onDone?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const user = currentUser();
      if (!user) throw new Error("Sign in first.");
      const body = new FormData();
      body.set("file", file);
      body.set("login", user.email);
      const res = await fetch("/api/avatar", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
      setAvatar(data.url);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this profile photo?")) return;
    setError("");
    setBusy(true);
    try {
      const user = currentUser();
      if (!user) throw new Error("Sign in first.");
      await fetch("/api/avatar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: user.email }),
      });
      clearAvatar();
      onDone?.();
    } catch (err) {
      clearAvatar();
      onDone?.();
      setError(err instanceof Error ? err.message : "Photo removed on this device.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <label className="btn ghost" style={{ display: "inline-block" }}>
        {busy ? "Working…" : hasPhoto ? "Change photo" : "Add photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={pick} />
      </label>
      {hasPhoto ? (
        <button className="btn ghost" type="button" disabled={busy} onClick={remove}>
          Delete photo
        </button>
      ) : null}
      {error ? <p className="error" style={{ width: "100%" }}>{error}</p> : null}
    </div>
  );
}
