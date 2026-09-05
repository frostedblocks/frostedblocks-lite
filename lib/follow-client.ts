export type FollowRow = {
  follower: string;
  target: string;
  targetName: string;
  source: "lite" | "network";
};

export type Person = {
  handle: string;
  name: string;
  avatar?: string;
  source: "lite";
  me?: boolean;
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
  return (data.people || []) as Person[];
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
