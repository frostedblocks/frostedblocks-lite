"use client";
import { useEffect, useState } from "react";
import { follow, isFollowing, unfollow } from "@/lib/follow-client";
import { useAuth } from "@/lib/use-auth";
import Link from "next/link";

export function FollowButton({
  target,
  targetName,
  source = "lite",
}: {
  target: string;
  targetName: string;
  source?: "lite" | "network";
}) {
  const { user, ready, signedIn } = useAuth();
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (user) setOn(isFollowing(user.email, target));
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
      onClick={() => {
        if (on) unfollow(user.email, target);
        else follow(user.email, target, targetName, source);
        setOn(!on);
      }}
    >
      {on ? "Following" : "Follow"}
    </button>
  );
}
