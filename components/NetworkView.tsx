"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listPublicUsers, type PublicUser } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";
import { LiteBadge, NetworkBadge } from "./LiteBadge";
import { ONCHAIN_URL } from "@/lib/canisters";

const NETWORK_PREVIEW = [
  { name: "Walter L. Wood", email: "on-chain", source: "network" as const },
];

export function NetworkView() {
  const { user, ready, signedIn } = useAuth();
  const [people, setPeople] = useState<PublicUser[]>([]);

  useEffect(() => {
    setPeople(listPublicUsers());
  }, [signedIn]);

  if (!ready) return null;

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
      <div className="kicker">People</div>
      <h1 style={{ fontSize: 40 }}>Network</h1>
      <p className="lead">Lite accounts on this site. ICE Network people show the green badge when the canister feed is connected.</p>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {people.map((p) => (
          <div key={p.email} className="glass partner" style={{ minWidth: 0 }}>
            <div className="post-top" style={{ margin: 0 }}>
              <div className="avatar">{(p.name || p.email).slice(0, 1).toUpperCase()}</div>
              <div>
                <b>{p.name} <LiteBadge /></b>
                <div className="meta">{p.email}</div>
              </div>
            </div>
            {signedIn && user?.email !== p.email ? (
              <Link className="btn ghost" href={`/messages?to=${encodeURIComponent(p.email)}`}>Message</Link>
            ) : null}
          </div>
        ))}
        {NETWORK_PREVIEW.map((p) => (
          <div key={p.email} className="glass partner" style={{ minWidth: 0 }}>
            <div className="post-top" style={{ margin: 0 }}>
              <div className="avatar">{p.name.slice(0, 1)}</div>
              <div>
                <b>{p.name} <NetworkBadge /></b>
                <div className="meta">On-chain · not a Lite inbox</div>
              </div>
            </div>
            <a className="btn ghost" href={ONCHAIN_URL}>ICE Network</a>
          </div>
        ))}
        {!people.length ? <p className="note">No Lite accounts on this device yet. Sign up to appear here.</p> : null}
      </div>
    </article>
  );
}
