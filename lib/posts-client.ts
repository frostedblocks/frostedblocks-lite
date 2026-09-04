import type { IcePost } from "./types";
import { SEED_FEED } from "./seed-feed";

export async function loadFeed(): Promise<IcePost[]> {
  try {
    const res = await fetch("/api/posts", { cache: "no-store" });
    const data = await res.json();
    return (data.posts || SEED_FEED) as IcePost[];
  } catch {
    return SEED_FEED;
  }
}

export async function createPost(content: string): Promise<IcePost> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not post.");
  return data.post as IcePost;
}

export async function deletePost(id: string) {
  const res = await fetch("/api/posts", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not delete.");
}
