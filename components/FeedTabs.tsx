"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LiteFeed } from "./LiteFeed";
import { FollowButton } from "./FollowButton";
import { LiteBadge } from "./LiteBadge";
import { loadPeople, type Person } from "@/lib/follow-client";

type Tab = "feed" | "users";

export function FeedTabs() {
  const [tab, setTab] = useState<Tab>("feed");
  const [people, setPeople] = useState<Person[]>([]);

  async function refreshPeople() {
    setPeople(await loadPeople());
  }

  useEffect(() => {
    if (tab === "users") void refreshPeople();
  }, [tab]);

  const others = people.filter((p) => !p.me);

  return (
    <div>
      <div className="chips" style={{ marginTop: 0 }}>
        <button className={tab === "feed" ? "btn" : "chip"} type="button" onClick={() => setTab("feed")}>
          Feed
        </button>
        <button className={tab === "users" ? "btn" : "chip"} type="button" onClick={() => setTab("users")}>
          New users
        </button>
      </div>
      {tab === "feed" ? <LiteFeed /> : null}
      {tab === "users" ? (
        <div className="glass" style={{ padding: 16 }}>
          <div className="feed-head">
            <span>New on ICE Lite</span>
            <span className="meta">{others.length}</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {others.map((p) => (
              <div key={p.handle} className="glass partner" style={{ minWidth: 0 }}>
                <div className="post-top" style={{ margin: 0 }}>
                  {p.avatar ? (
                    <img className="avatar" src={p.avatar} alt="" />
                  ) : (
                    <div className="avatar">{p.name.slice(0, 1).toUpperCase()}</div>
                  )}
                  <div>
                    <b>{p.name} <LiteBadge /></b>
                  </div>
                </div>
                <FollowButton target={p.handle} targetName={p.name} onChange={() => { void refreshPeople(); }} />
              </div>
            ))}
            {!others.length ? (
              <p className="note">
                No other accounts yet.{" "}
                <Link href="/signup">Create Lite account</Link>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
