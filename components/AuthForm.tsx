"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") signUp(email, password, name);
      else signIn(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" ? (
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
      ) : null}
      <label>
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      </label>
      <label>
        Password
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit">{mode === "signup" ? "Create account" : "Sign in"}</button>
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
