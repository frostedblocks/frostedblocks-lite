"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listPublicUsers, type PublicUser } from "@/lib/auth-client";
import { followersOf, followingOf, type FollowRow } from "@/lib/follow-client";
import { useAuth } from "@/lib/use-auth";
import { LiteBadge, NetworkBadge } from "./LiteBadge";
import { FollowButton } from "./FollowButton";

const NETWORK_PEOPLE = [
  { name: "Walter L. Wood", target: "network:walter", source: "network" as const },
];

type Tab = "following" | "followers" | "people";

export function NetworkView() {
  const { user, ready, signedIn } = useAuth();
  const [tab, setTab] = useState<Tab>("following");
  const [people, setPeople] = useState<PublicUser[]>([]);
  const [following, setFollowing] = useState<FollowRow[]>([]);
  const [followers, setFollowers] = useState<FollowRow[]>([]);

  function refresh() {
    setPeople(listPublicUsers());
    if (user) {
      setFollowing(followingOf(user.email));
      setFollowers(followersOf(user.email));
    } else {
      setFollowing([]);
      setFollowers([]);
    }
  }

  useEffect(() => {
    refresh();
  }, [user]);

  if (!ready) return null;

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 760, margin: "0 auto" }}>
      <div className="kicker">Follow graph</div>
      <h1 style={{ fontSize: 40 }}>Network</h1>
      <p className="lead">Same idea as ICE Network: people you follow, and people who follow you.</p>
      <div className="chips">
        <button className={tab === "following" ? "btn" : "chip"} onClick={() => { setTab("following"); refresh(); }}>Following {following.length}</button>
        <button className={tab === "followers" ? "btn" : "chip"} onClick={() => { setTab("followers"); refresh(); }}>Followers {followers.length}</button>
        <button className={tab === "people" ? "btn" : "chip"} onClick={() => { setTab("people"); refresh(); }}>People</button>
      </div>

      {!signedIn ? (
        <p className="note">Sign in to follow someone. <Link href="/signin">Sign in</Link></p>
      ) : null}

      {tab === "following" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <p className="note">Following — people you follow</p>
          {following.map((row) => (
            <PersonRow
              key={row.target}
              name={row.targetName}
              target={row.target}
              source={row.source}
              onChange={refresh}
            />
          ))}
          {!following.length ? <p className="note">You are not following anyone yet. Open People and hit Follow.</p> : null}
        </div>
      ) : null}

      {tab === "followers" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <p className="note">Followers — people who follow you</p>
          {followers.map((row) => (
            <PersonRow
              key={row.follower}
              name={row.follower}
              target={row.follower}
              source="lite"
              onChange={refresh}
            />
          ))}
          {!followers.length ? <p className="note">No followers on this device yet.</p> : null}
        </div>
      ) : null}

      {tab === "people" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {people.map((p) => (
            <PersonRow key={p.email} name={p.name} target={p.email} source="lite" subtitle={p.email} onChange={refresh} />
          ))}
          {NETWORK_PEOPLE.map((p) => (
            <PersonRow key={p.target} name={p.name} target={p.target} source="network" subtitle="ICE Network account" onChange={refresh} />
          ))}
          {!people.length ? <p className="note">No other Lite accounts on this device. Sign up a second account in another browser profile to follow them.</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function PersonRow({
  name,
  target,
  source,
  subtitle,
  onChange,
}: {
  name: string;
  target: string;
  source: "lite" | "network";
  subtitle?: string;
  onChange: () => void;
}) {
  return (
    <div className="glass partner" style={{ minWidth: 0 }} onClick={onChange}>
      <div className="post-top" style={{ margin: 0 }}>
        <div className="avatar">{name.slice(0, 1).toUpperCase()}</div>
        <div>
          <b>
            {name} {source === "lite" ? <LiteBadge /> : <NetworkBadge />}
          </b>
          {subtitle ? <div className="meta">{subtitle}</div> : null}
        </div>
      </div>
      <span onClick={(e) => e.stopPropagation()}>
        <FollowButton target={target} targetName={name} source={source} />
      </span>
    </div>
  );
}
