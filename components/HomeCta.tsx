"use client";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { ONCHAIN_URL } from "@/lib/canisters";

export function HomeCta() {
  const { signedIn, ready } = useAuth();

  function explore() {
    const el = document.getElementById("live-feed");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.href = "/feed";
  }

  if (!ready) return null;

  if (signedIn) {
    return (
      <div className="cta-row">
        <Link className="btn" href="/feed">Explore the live feed</Link>
        <Link className="btn ghost" href="/profile">Your Lite profile</Link>
        <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">Open ICE Network</a>
      </div>
    );
  }

  return (
    <div className="cta-row">
      <Link className="btn" href="/signup">Try it free</Link>
      <button className="btn ghost" type="button" onClick={explore}>Explore the live feed</button>
      <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">Own it on-chain</a>
      <p className="note" style={{ width: "100%", margin: "4px 0 0" }}>
        Email or phone. About a minute. No wallet on this site.
      </p>
    </div>
  );
}
