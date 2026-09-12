"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadFollows, loadPeople, type FollowRow, type Person } from "@/lib/follow-client";
import { useAuth } from "@/lib/use-auth";
import { LiteBadge } from "./LiteBadge";
import { FollowButton } from "./FollowButton";

type Tab = "arrived" | "following" | "followers";

function joinedLabel(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const days = Math.round((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Joined today";
  if (days === 1) return "Joined yesterday";
  if (days < 14) return `Joined ${days}d ago`;
  return `Joined ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function NetworkView() {
  const { ready, signedIn } = useAuth();
  const [tab, setTab] = useState<Tab>("arrived");
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

  const arrived = useMemo(() => {
    return people
      .filter((p) => !p.me)
      .slice()
      .sort((a, b) => {
        const at = a.joined ? new Date(a.joined).getTime() : 0;
        const bt = b.joined ? new Date(b.joined).getTime() : 0;
        return bt - at;
      });
  }, [people]);

  if (!ready) return null;

  return (
    <article className="glass" style={{ padding: 28, maxWidth: 760, margin: "0 auto" }}>
      <div className="kicker">Near the door</div>
      <h1 style={{ fontSize: 40 }}>Lite foyer</h1>
      <p className="lead">
        A small lobby before the ICE Network — meet people who just walked in, follow by name, say hello.
      </p>

      <div className="glass stack-item" style={{ marginTop: 8 }}>
        <strong>How this works</strong>
        <p className="note" style={{ margin: "8px 0 0" }}>
          Names only — no emails on screen. Follow someone here, or message them from the foyer. The full ICE Network stays on-chain; this is the Lite door.
        </p>
        <div className="cta-row" style={{ marginTop: 12 }}>
          {!signedIn ? (
            <>
              <Link className="btn" href="/signup">Join the foyer</Link>
              <Link className="btn ghost" href="/signin">Sign in</Link>
            </>
          ) : (
            <>
              <Link className="btn ghost" href="/messages">Open messages</Link>
              <Link className="btn ghost" href="/feed">Back to feed</Link>
            </>
          )}
        </div>
      </div>

      <div className="chips">
        <button
          className={tab === "arrived" ? "btn" : "chip"}
          type="button"
          onClick={() => { setTab("arrived"); void refresh(); }}
        >
          Just arrived {arrived.length}
        </button>
        <button
          className={tab === "following" ? "btn" : "chip"}
          type="button"
          onClick={() => { setTab("following"); void refresh(); }}
        >
          Your circle {following.length}
        </button>
        <button
          className={tab === "followers" ? "btn" : "chip"}
          type="button"
          onClick={() => { setTab("followers"); void refresh(); }}
        >
          Saying hello {followers.length}
        </button>
      </div>

      {!signedIn ? (
        <p className="note">Sign in to follow or message someone in the foyer.</p>
      ) : null}

      {tab === "arrived" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {arrived.map((p) => (
            <PersonRow
              key={p.handle}
              name={p.name}
              target={p.handle}
              avatar={p.avatar}
              meta={joinedLabel(p.joined)}
              onChange={() => { void refresh(); }}
            />
          ))}
          {!arrived.length ? (
            <p className="note">
              Nobody else is in the foyer yet.{" "}
              <Link href="/signup">Create a Lite account</Link> and you’ll show up here for the next person through the door.
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "following" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {following.map((row) => (
            <PersonRow
              key={row.target}
              name={row.targetName}
              target={row.target}
              meta="In your circle"
              onChange={() => { void refresh(); }}
            />
          ))}
          {!following.length ? (
            <p className="note">Your circle is empty. Open <strong>Just arrived</strong> and follow someone new.</p>
          ) : null}
        </div>
      ) : null}

      {tab === "followers" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {followers.map((row) => (
            <PersonRow
              key={row.follower}
              name={row.targetName}
              target={row.follower}
              meta="Follows you"
              onChange={() => { void refresh(); }}
            />
          ))}
          {!followers.length ? (
            <p className="note">No one has said hello yet. Post on the feed so people can find you.</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function PersonRow({
  name,
  target,
  avatar,
  meta,
  onChange,
}: {
  name: string;
  target: string;
  avatar?: string;
  meta?: string;
  onChange: () => void;
}) {
  return (
    <div className="glass partner" style={{ minWidth: 0 }}>
      <div className="post-top" style={{ margin: 0 }}>
        {avatar ? (
          <img className="avatar" src={avatar} alt="" />
        ) : (
          <div className="avatar">{name.slice(0, 1).toUpperCase()}</div>
        )}
        <div>
          <b>
            {name} <LiteBadge />
          </b>
          {meta ? <div className="meta">{meta}</div> : null}
        </div>
      </div>
      <div className="cta-row">
        <FollowButton target={target} targetName={name} source="lite" onChange={onChange} />
        <Link className="btn ghost" href={`/messages?with=${encodeURIComponent(target)}`}>
          Message
        </Link>
      </div>
    </div>
  );
}
