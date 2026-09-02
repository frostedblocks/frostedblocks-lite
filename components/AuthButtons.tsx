"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { currentUser, signOut } from "@/lib/auth-client";

export function AuthButtons() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(currentUser()?.email ?? null);
  }, []);

  if (email) {
    return (
      <>
        <Link className="btn ghost" href="/profile">Profile</Link>
        <button
          className="btn ghost"
          onClick={() => {
            signOut();
            setEmail(null);
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
      <Link href="/signin">Sign in</Link>
      <Link className="btn" href="/signup">Sign up</Link>
    </>
  );
}
