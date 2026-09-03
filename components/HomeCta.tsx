"use client";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

export function HomeCta() {
  const { signedIn, ready } = useAuth();
  if (!ready) return null;
  if (signedIn) {
    return (
      <div className="glass cta-box">
        <strong>You are signed in</strong>
        <p className="note">Open the live feed to read and post.</p>
        <Link className="btn" href="/feed">Open live feed</Link>
      </div>
    );
  }
  return (
    <div className="glass cta-box">
      <strong>Ready to enter?</strong>
      <p className="note">Sign in with email. No wallet popups on this site.</p>
      <Link className="btn" href="/signin">Sign in with email</Link>
    </div>
  );
}
