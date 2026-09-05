"use client";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";

export function AuthButtons() {
  const { user, ready } = useAuth();
  if (!ready) return null;

  if (user) {
    return (
      <>
        <Link className="btn ghost" href="/profile">Profile</Link>
        <button
          className="btn ghost"
          onClick={async () => {
            await signOut();
            window.location.replace("/");
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
