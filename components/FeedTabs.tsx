"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LiteFeed } from "./LiteFeed";
import { FollowButton } from "./FollowButton";
import { LiteBadge } from "./LiteBadge";
import { loadPeople } from "@/lib/follow-client";
import { useAuth } from "@/lib/use-auth";

type Tab = "feed" | "users";

export function FeedTabs() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("feed");
  const [people, setPeople] = useState<{ email: string; name: string; avatar?: string }[]>([]);

  async function refreshPeople() {
    setPeople(await loadPeople());
  }

  useEffect(() => {
    if (tab === "users") void refreshPeople();
  }, [tab]);

  const others = people.filter((p) => p.email !== user?.email);

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
              <div key={p.email} className="glass partner" style={{ minWidth: 0 }}>
                <div className="post-top" style={{ margin: 0 }}>
                  {p.avatar ? (
                    <img className="avatar" src={p.avatar} alt="" />
                  ) : (
                    <div className="avatar">{(p.name || p.email).slice(0, 1).toUpperCase()}</div>
                  )}
                  <div>
                    <b>{p.name || p.email} <LiteBadge /></b>
                    <div className="meta">{p.email}</div>
                  </div>
                </div>
                <FollowButton target={p.email} targetName={p.name || p.email} onChange={() => { void refreshPeople(); }} />
              </div>
            ))}
            {!others.length ? (
              <p className="note">
                No other accounts yet. When someone signs up they show here first.{" "}
                <Link href="/signup">Invite them to Lite</Link>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
