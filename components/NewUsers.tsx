"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadPeople, type Person } from "@/lib/follow-client";
import { profilePath } from "@/lib/public";
import { FollowButton } from "./FollowButton";
import { LiteBadge } from "./LiteBadge";

export function NewUsers() {
  const [people, setPeople] = useState<Person[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadPeople()
      .then((rows) => setPeople(rows))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <p className="note">Loading new users…</p>;

  return (
    <div className="glass" style={{ padding: 12 }}>
      <div className="feed-head">
        <span>Newest Lite accounts</span>
        <span className="meta">{people.length}</span>
      </div>
      {people.length ? (
        people.map((p) => (
          <div key={p.handle} className="glass partner" style={{ marginBottom: 10, minWidth: 0 }}>
            <div className="post-top" style={{ margin: 0 }}>
              <Link href={profilePath(p.handle)} aria-label={`${p.name} profile`}>
                {p.avatar ? (
                  <img className="avatar" src={p.avatar} alt="" />
                ) : (
                  <div className="avatar">{p.name.slice(0, 1).toUpperCase()}</div>
                )}
              </Link>
              <div>
                <b>
                  <Link href={profilePath(p.handle)} style={{ color: "inherit", textDecoration: "none" }}>
                    {p.name}
                  </Link>{" "}
                  <LiteBadge />
                </b>
              </div>
            </div>
            {p.me ? (
              <Link className="btn ghost" href="/profile">You</Link>
            ) : (
              <FollowButton target={p.handle} targetName={p.name} />
            )}
          </div>
        ))
      ) : (
        <p className="note">No Lite accounts in the database yet. Sign up and the first name lands here.</p>
      )}
    </div>
  );
}
