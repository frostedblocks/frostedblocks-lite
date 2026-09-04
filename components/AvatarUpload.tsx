"use client";
import { useState } from "react";
import { clearAvatar, currentUser, setAvatar } from "@/lib/auth-client";

export function AvatarUpload({ onDone }: { onDone?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      if (!currentUser()) throw new Error("Sign in first.");
      const body = new FormData();
      body.set("file", file);
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
      if (!currentUser()) throw new Error("Sign in first.");
      const res = await fetch("/api/avatar", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete.");
      }
      clearAvatar();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <label className="btn ghost" style={{ display: "inline-block" }}>
        {busy ? "Working…" : "Change photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={pick} />
      </label>
      <button className="btn ghost" type="button" disabled={busy} onClick={remove}>
        Delete photo
      </button>
      {error ? <p className="error" style={{ width: "100%" }}>{error}</p> : null}
    </div>
  );
}
