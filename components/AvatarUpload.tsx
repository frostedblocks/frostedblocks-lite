"use client";
import { useState } from "react";
import { currentUser, setAvatar } from "@/lib/auth-client";

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

  return (
    <div>
      <label className="btn ghost" style={{ display: "inline-block" }}>
        {busy ? "Uploading…" : "Change photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={pick} />
      </label>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
