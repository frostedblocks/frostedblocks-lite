"use client";
import { useEffect, useState } from "react";
import { follow, loadFollows, unfollow } from "@/lib/follow-client";
import { useAuth } from "@/lib/use-auth";
import Link from "next/link";

export function FollowButton({
  target,
  targetName,
  onChange,
}: {
  target: string;
  targetName: string;
  source?: "lite" | "network";
  onChange?: () => void;
}) {
  const { user, ready, signedIn } = useAuth();
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadFollows().then(({ following }) => {
      setOn(following.some((r) => r.target === target));
    });
  }, [user, target]);

  if (!ready) return null;
  if (!signedIn || !user) {
    return <Link className="btn ghost" href="/signin">Sign in to follow</Link>;
  }
  if (user.email === target) return null;

  return (
    <button
      className={on ? "btn ghost" : "btn"}
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          if (on) await unfollow(user.email, target);
          else await follow(user.email, target);
          setOn(!on);
          onChange?.();
        } catch (err) {
          window.alert(err instanceof Error ? err.message : "Could not update follow.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {on ? "Following" : "Follow"} {targetName ? "" : ""}
    </button>
  );
}
