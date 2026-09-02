"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { currentUser, signOut } from "@/lib/auth-client";

export function AuthButtons() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEmail(currentUser()?.email ?? null);
    setReady(true);
  }, []);

  if (!ready) return null;

  if (email) {
    return (
      <>
        <Link className="btn ghost" href="/profile">Profile</Link>
        <button
          className="btn ghost"
          onClick={() => {
            signOut();
            window.location.href = "/";
          }}
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <>
      <Link className="btn ghost" href="/signin">Sign in</Link>
      <Link className="btn" href="/signup">Sign up</Link>
    </>
  );
}
