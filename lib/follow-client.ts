export type FollowRow = {
  follower: string;
  target: string;
  targetName: string;
  source: "lite" | "network";
};

export async function loadFollows() {
  const res = await fetch("/api/follows", { cache: "no-store" });
  const data = await res.json();
  return {
    following: (data.following || []) as FollowRow[],
    followers: (data.followers || []) as FollowRow[],
  };
}

export async function loadPeople() {
  const res = await fetch("/api/people", { cache: "no-store" });
  const data = await res.json();
  return (data.people || []) as { email: string; name: string; avatar?: string; source: "lite" }[];
}

export function followingOf(_follower: string) {
  return [] as FollowRow[];
}

export function followersOf(_target: string) {
  return [] as FollowRow[];
}

export function isFollowing(_follower: string, _target: string) {
  return false;
}

export async function follow(_follower: string, target: string) {
  const res = await fetch("/api/follows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not follow.");
}

export async function unfollow(_follower: string, target: string) {
  const res = await fetch("/api/follows", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not unfollow.");
}
