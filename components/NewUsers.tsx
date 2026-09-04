"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadPeople } from "@/lib/follow-client";
import { useAuth } from "@/lib/use-auth";
import { FollowButton } from "./FollowButton";
import { LiteBadge } from "./LiteBadge";

type Person = { email: string; name: string; avatar?: string; joined?: string };

export function NewUsers() {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadPeople()
      .then((rows) => setPeople(rows as Person[]))
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
          <div key={p.email} className="glass partner" style={{ marginBottom: 10, minWidth: 0 }}>
            <div className="post-top" style={{ margin: 0 }}>
              {p.avatar ? (
                <img className="avatar" src={p.avatar} alt="" />
              ) : (
                <div className="avatar">{(p.name || p.email).slice(0, 1).toUpperCase()}</div>
              )}
              <div>
                <b>
                  {p.name || p.email} <LiteBadge />
                </b>
                <div className="meta">{p.email}</div>
              </div>
            </div>
            {user?.email === p.email ? (
              <Link className="btn ghost" href="/profile">You</Link>
            ) : (
              <FollowButton target={p.email} targetName={p.name || p.email} />
            )}
          </div>
        ))
      ) : (
        <p className="note">No Lite accounts in the database yet. Sign up and the first name lands here.</p>
      )}
    </div>
  );
}
