"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { GoogleButton } from "./GoogleButton";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { signedIn, ready } = useAuth();
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && signedIn) window.location.replace("/feed");
  }, [ready, signedIn]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const why = params.get("error");
    if (why) setError("Google sign-in did not finish. Check the Google keys on Vercel.");
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") signUp(login, password, name);
      else signIn(login, password);
      window.location.href = "/feed";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
    }
  }

  if (!ready || signedIn) return null;

  return (
    <form className="auth-form" onSubmit={submit}>
      <GoogleButton />
      <p className="note" style={{ textAlign: "center" }}>or use email / phone</p>
      {mode === "signup" ? (
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
      ) : null}
      <label>
        Email or phone
        <input
          required
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="you@email.com or 3025551234"
        />
      </label>
      <label>
        Password
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit">{mode === "signup" ? "Create account" : "Sign in"}</button>
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
