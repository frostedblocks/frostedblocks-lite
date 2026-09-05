"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { loadFollows, loadPeople, type FollowRow, type Person } from "@/lib/follow-client";
import { useAuth } from "@/lib/use-auth";
import { LiteBadge } from "./LiteBadge";
import { FollowButton } from "./FollowButton";

type Tab = "following" | "followers" | "people";

export function NetworkView() {
  const { ready, signedIn } = useAuth();
  const [tab, setTab] = useState<Tab>("people");
  const [people, setPeople] = useState<Person[]>([]);
  const [following, setFollowing] = useState<FollowRow[]>([]);
  const [followers, setFollowers] = useState<FollowRow[]>([]);

  const refresh = useCallback(async () => {
    setPeople(await loadPeople());
    const graph = await loadFollows();
    setFollowing(graph.following);
    setFollowers(graph.followers);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!ready) return null;

  const others = people.filter((p) => !p.me);

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 760, margin: "0 auto" }}>
      <div className="kicker">ICE Lite</div>
      <h1 style={{ fontSize: 40 }}>Lite network</h1>
      <p className="lead">Follow Lite users by name. Emails stay private.</p>
      <div className="chips">
        <button className={tab === "people" ? "btn" : "chip"} onClick={() => { setTab("people"); void refresh(); }}>People</button>
        <button className={tab === "following" ? "btn" : "chip"} onClick={() => { setTab("following"); void refresh(); }}>Following {following.length}</button>
        <button className={tab === "followers" ? "btn" : "chip"} onClick={() => { setTab("followers"); void refresh(); }}>Followers {followers.length}</button>
      </div>

      {!signedIn ? (
        <p className="note">Sign in to follow someone on ICE Lite. <Link href="/signin">Sign in</Link></p>
      ) : null}

      {tab === "people" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {others.map((p) => (
            <PersonRow key={p.handle} name={p.name} target={p.handle} onChange={() => { void refresh(); }} />
          ))}
          {!others.length ? <p className="note">No other Lite accounts yet.</p> : null}
        </div>
      ) : null}

      {tab === "following" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {following.map((row) => (
            <PersonRow key={row.target} name={row.targetName} target={row.target} onChange={() => { void refresh(); }} />
          ))}
          {!following.length ? <p className="note">You are not following anyone on ICE Lite yet.</p> : null}
        </div>
      ) : null}

      {tab === "followers" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {followers.map((row) => (
            <PersonRow key={row.follower} name={row.targetName} target={row.follower} onChange={() => { void refresh(); }} />
          ))}
          {!followers.length ? <p className="note">No Lite followers yet.</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function PersonRow({
  name,
  target,
  onChange,
}: {
  name: string;
  target: string;
  onChange: () => void;
}) {
  return (
    <div className="glass partner" style={{ minWidth: 0 }}>
      <div className="post-top" style={{ margin: 0 }}>
        <div className="avatar">{name.slice(0, 1).toUpperCase()}</div>
        <div>
          <b>{name} <LiteBadge /></b>
        </div>
      </div>
      <FollowButton target={target} targetName={name} source="lite" onChange={onChange} />
    </div>
  );
}
