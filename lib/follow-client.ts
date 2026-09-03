export type FollowRow = {
  follower: string;
  target: string;
  targetName: string;
  source: "lite" | "network";
};

const KEY = "ice-lite-follows";

function read(): FollowRow[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(rows: FollowRow[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function isFollowing(follower: string, target: string) {
  return read().some((r) => r.follower === follower && r.target === target);
}

export function followingOf(follower: string) {
  return read().filter((r) => r.follower === follower);
}

export function followersOf(target: string) {
  return read().filter((r) => r.target === target);
}

export function follow(follower: string, target: string, targetName: string, source: "lite" | "network") {
  if (!follower) throw new Error("Sign in to follow someone.");
  if (follower === target) throw new Error("You cannot follow yourself.");
  if (isFollowing(follower, target)) return;
  write([...read(), { follower, target, targetName, source }]);
}

export function unfollow(follower: string, target: string) {
  write(read().filter((r) => !(r.follower === follower && r.target === target)));
}
