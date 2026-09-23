"use client";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

export function HomeCta() {
  const { signedIn, ready } = useAuth();

  if (!ready) return null;

  if (signedIn) {
    return (
      <div className="cta-row">
        <Link className="btn" href="/feed">
          Open feed
        </Link>
      </div>
    );
  }

  return (
    <div className="cta-row">
      <Link className="btn" href="/signup">
        Post free
      </Link>
      <Link className="btn ghost" href="/signin">
        Sign in
      </Link>
    </div>
  );
}
