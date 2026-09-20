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

  // Signup and return → feed (Circles path retired).
  const afterAuth = "/feed";

  useEffect(() => {
    if (ready && signedIn) window.location.replace(afterAuth);
  }, [ready, signedIn, afterAuth]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") await signUp(login, password, name);
      else await signIn(login, password);
      window.location.href = afterAuth;
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
        {mode === "signup" ? "Email" : "Email or phone"}
        <input
          required
          type={mode === "signup" ? "email" : undefined}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder={mode === "signup" ? "you@email.com" : "you@email.com or phone"}
          inputMode="email"
          autoComplete={mode === "signup" ? "email" : "username"}
        />
      </label>
      <label>
        Password
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
      {mode === "signup" ? (
        <p className="note">
          By creating an account you agree to the <Link href="/terms">Terms</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>. We’ll email a link — open it, then you’re in.
        </p>
      ) : (
        <Link className="btn ghost" href="/forgot" style={{ textAlign: "center" }}>Forgot password</Link>
      )}
      <p className="note">
        {mode === "signup" ? (
          <>
            Already have an account? <Link href="/signin">Sign in</Link>
          </>
        ) : (
          <>
            No account yet? <Link href="/signup">Create account</Link>
          </>
        )}
      </p>
    </form>
  );
}
