"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { currentUser, signOut, signOutEverywhere } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { AvatarUpload } from "./AvatarUpload";
import type { LiteUser } from "@/lib/auth-client";

export function SettingsView() {
  const { verified, hasEmail, ready: authReady } = useAuth();
  const [user, setUser] = useState<LiteUser | null>(null);
  const [ready, setReady] = useState(false);

  function refresh() {
    setUser(currentUser());
    setReady(true);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!ready || !authReady) return null;

  if (!user) {
    return (
      <article className="glass page-card">
        <div className="kicker">Settings</div>
        <h1 style={{ fontSize: 40 }}>Sign in first</h1>
        <p className="lead">Account settings are only for signed-in Lite users.</p>
        <p style={{ marginTop: 20 }}>
          <Link className="btn" href="/signin">Sign in</Link>
        </p>
      </article>
    );
  }

  return (
    <article className="glass page-card">
      <div className="kicker">Settings</div>
      <h1 style={{ fontSize: 40 }}>Account</h1>
      <p className="lead">Manage your Lite login, photo, and privacy options.</p>

      <div className="stack" style={{ marginTop: 20 }}>
        <div className="glass stack-item">
          <strong>Profile</strong>
          <p className="note" style={{ marginBottom: 10 }}>
            {user.name || "Lite user"}
            {hasEmail ? (verified ? " · email confirmed" : " · email not confirmed yet") : " · phone account"}
          </p>
          <p className="note">Other people see your name and photo, not your email or phone.</p>
          <p style={{ marginTop: 12 }}>
            <Link className="btn ghost" href="/profile">Open profile</Link>
          </p>
        </div>

        <div className="glass stack-item">
          <strong>Photo</strong>
          <p className="note" style={{ marginBottom: 10 }}>JPG, PNG, or WEBP up to 2MB.</p>
          <AvatarUpload onDone={refresh} />
        </div>

        <div className="glass stack-item">
          <strong>Security</strong>
          <p className="note" style={{ marginBottom: 10 }}>Change your password or clear every signed-in session.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link className="btn ghost" href="/reset">Change password</Link>
            <button
              className="btn ghost"
              type="button"
              onClick={async () => {
                await signOutEverywhere();
                window.location.replace("/");
              }}
            >
              Sign out everywhere
            </button>
          </div>
        </div>

        <div className="glass stack-item">
          <strong>Privacy</strong>
          <p className="note" style={{ marginBottom: 10 }}>
            Read what Lite stores, or ask to access or delete your data.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link className="btn ghost" href="/privacy">Privacy policy</Link>
            <Link className="btn ghost" href="/contact">Request data help</Link>
          </div>
        </div>

        <div className="glass stack-item">
          <strong>Session</strong>
          <p className="note" style={{ marginBottom: 10 }}>Sign out on this device only.</p>
          <button
            className="btn ghost"
            type="button"
            onClick={async () => {
              await signOut();
              window.location.replace("/");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </article>
  );
}
