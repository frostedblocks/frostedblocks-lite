"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { signedIn, ready } = useAuth();
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && signedIn) window.location.replace("/feed");
  }, [ready, signedIn]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") await signUp(login, password, name);
      else await signIn(login, password);
      window.location.href = "/feed";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || signedIn) return null;

  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" ? (
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
      ) : null}
      <label>
        Email or phone
        <input required value={login} onChange={(e) => setLogin(e.target.value)} placeholder="you@email.com or 3025551234" />
      </label>
      <label>
        Password
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
      {mode === "signin" ? (
        <Link className="btn ghost" href="/reset" style={{ textAlign: "center" }}>
          Forgot password
        </Link>
      ) : null}
      <p className="note">
        {mode === "signup" ? (
          <>Already have an account? <Link href="/signin">Sign in</Link></>
        ) : (
          <>No account yet? <Link href="/signup">Sign up</Link></>
        )}
      </p>
    </form>
  );
}
