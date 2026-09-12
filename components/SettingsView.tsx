"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteAccount,
  refreshSession,
  signOut,
  signOutEverywhere,
  updateDisplayName,
  type LiteUser,
} from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { AvatarUpload } from "./AvatarUpload";

export function SettingsView() {
  const { verified, hasEmail, ready: authReady } = useAuth();
  const [user, setUser] = useState<LiteUser | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [nameMsg, setNameMsg] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resendErr, setResendErr] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteErr, setDeleteErr] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function refresh() {
    const session = await refreshSession();
    const u = session.user;
    setUser(u);
    setName(u?.name || "");
    setReady(true);
  }

  useEffect(() => {
    void refresh();
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

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameErr("");
    setNameMsg("");
    setNameBusy(true);
    try {
      const next = await updateDisplayName(name);
      setName(next);
      setNameMsg("Display name saved.");
      await refresh();
    } catch (err) {
      setNameErr(err instanceof Error ? err.message : "Could not save name.");
    } finally {
      setNameBusy(false);
    }
  }

  async function resendConfirm() {
    setResendErr("");
    setResendMsg("");
    setResendBusy(true);
    try {
      const res = await fetch("/api/auth/resend", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send email.");
      if (data.alreadyVerified) {
        setResendMsg("Email already confirmed. Reloading…");
        await refreshSession();
        window.location.reload();
        return;
      }
      setResendMsg("Confirm email sent. Check inbox and spam, open the link, then tap Confirm my email.");
    } catch (err) {
      setResendErr(err instanceof Error ? err.message : "Could not send email.");
    } finally {
      setResendBusy(false);
    }
  }

  async function wipeAccount(e: React.FormEvent) {
    e.preventDefault();
    if (
      !window.confirm(
        "This permanently deletes your Lite account, posts, follows, and messages. This cannot be undone.",
      )
    ) {
      return;
    }
    setDeleteErr("");
    setDeleteBusy(true);
    try {
      await deleteAccount(deleteConfirm, deletePassword);
      window.location.replace("/");
    } catch (err) {
      setDeleteErr(err instanceof Error ? err.message : "Could not delete account.");
      setDeleteBusy(false);
    }
  }

  return (
    <article className="glass page-card">
      <div className="kicker">Settings</div>
      <h1 style={{ fontSize: 40 }}>Account</h1>
      <p className="lead">Manage your Lite login, photo, and privacy options.</p>

      <div className="stack" style={{ marginTop: 20 }}>
        <div className="glass stack-item">
          <strong>Display name</strong>
          <p className="note" style={{ marginBottom: 10 }}>
            Other people see this name and your photo — not your email or phone.
          </p>
          <form className="auth-form" onSubmit={saveName} style={{ marginTop: 0 }}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
            </label>
            {nameErr ? <p className="error">{nameErr}</p> : null}
            {nameMsg ? <p className="note">{nameMsg}</p> : null}
            <button className="btn" type="submit" disabled={nameBusy}>
              {nameBusy ? "Saving…" : "Save name"}
            </button>
          </form>
          <p style={{ marginTop: 12 }}>
            <Link className="btn ghost" href="/profile">Open profile</Link>
          </p>
        </div>

        <div className="glass stack-item">
          <strong>Email status</strong>
          {!hasEmail ? (
            <p className="note" style={{ marginBottom: 0 }}>
              Phone account — no email confirm needed. You can post, follow, and message.
            </p>
          ) : verified ? (
            <p className="note" style={{ marginBottom: 0 }}>
              Email confirmed. You’re cleared to post, follow, and message on ICE Lite.
            </p>
          ) : (
            <>
              <p className="note" style={{ marginBottom: 10 }}>
                Email not confirmed yet. Tap Send confirm email, open the new link, then tap Confirm my email.
                Or use Google sign-in with the same address to confirm in one step.
              </p>
              {resendErr ? <p className="error">{resendErr}</p> : null}
              {resendMsg ? <p className="note">{resendMsg}</p> : null}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn" type="button" disabled={resendBusy} onClick={() => { void resendConfirm(); }}>
                  {resendBusy ? "Sending…" : "Send confirm email"}
                </button>
                <Link className="btn ghost" href="/signin">Sign in with Google</Link>
              </div>
            </>
          )}
        </div>

        <div className="glass stack-item">
          <strong>Photo</strong>
          <p className="note" style={{ marginBottom: 10 }}>JPG, PNG, or WEBP up to 2MB.</p>
          <AvatarUpload onDone={() => { void refresh(); }} />
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
          <strong>Privacy & delete</strong>
          <p className="note" style={{ marginBottom: 10 }}>
            Deleting wipes your Lite account, posts, follows, messages, and photo right away. Type{" "}
            <code>DELETE</code> to confirm. Password accounts should also enter their password; Google-only
            sign-in can leave password blank.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <Link className="btn ghost" href="/privacy">Privacy policy</Link>
            <Link className="btn ghost" href="/contact">Other account help</Link>
          </div>
          <form className="auth-form" onSubmit={wipeAccount} style={{ marginTop: 0 }}>
            <label>
              Password (if you have one)
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label>
              Type DELETE to confirm
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                required
              />
            </label>
            {deleteErr ? <p className="error">{deleteErr}</p> : null}
            <button className="btn ghost" type="submit" disabled={deleteBusy || deleteConfirm !== "DELETE"}>
              {deleteBusy ? "Deleting…" : "Delete my account forever"}
            </button>
          </form>
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
