"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadPeople, type Person } from "@/lib/follow-client";
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
              {p.avatar ? (
                <img className="avatar" src={p.avatar} alt="" />
              ) : (
                <div className="avatar">{p.name.slice(0, 1).toUpperCase()}</div>
              )}
              <div>
                <b>
                  {p.name} <LiteBadge />
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
