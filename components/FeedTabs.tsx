"use client";
import { useEffect, useState } from "react";
import { LiteFeed } from "./LiteFeed";
import { NewUsers } from "./NewUsers";

export function FeedTabs() {
  const [tab, setTab] = useState<"feed" | "users">("feed");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "users") setTab("users");
  }, []);

  return (
    <div>
      <div className="chips" style={{ marginTop: 0 }}>
        <button className={tab === "feed" ? "btn" : "chip"} type="button" onClick={() => setTab("feed")}>
          Live feed
        </button>
        <button className={tab === "users" ? "btn" : "chip"} type="button" onClick={() => setTab("users")}>
          New users
        </button>
      </div>
      {tab === "feed" ? <LiteFeed /> : <NewUsers />}
    </div>
  );
}
