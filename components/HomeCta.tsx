"use client";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { ONCHAIN_URL } from "@/lib/canisters";

export function HomeCta() {
  const { signedIn, ready } = useAuth();

  if (!ready) return null;

  if (signedIn) {
    return (
      <div className="cta-row">
        <Link className="btn" href="/feed">Open feed</Link>
        <Link className="btn ghost" href="/profile">Profile</Link>
        <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">ICE Network</a>
      </div>
    );
  }

  return (
    <div className="cta-row">
      <Link className="btn" href="/signup">Try it free</Link>
      <Link className="btn ghost" href="/signin">Sign in</Link>
      <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">ICE Network</a>
    </div>
  );
}
