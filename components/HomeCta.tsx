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
        <Link className="btn" href="/feed">
          Open feed
        </Link>
        <a className="btn ghost" href={ONCHAIN_URL} rel="noopener noreferrer">
          Creators → ICE Network
        </a>
      </div>
    );
  }

  return (
    <div className="cta-row">
      <Link className="btn" href="/signup">
        Create account
      </Link>
      <Link className="btn ghost" href="/signin">
        Sign in
      </Link>
    </div>
  );
}
