import type { IcePost } from "./types";
import { SEED_FEED } from "./seed-feed";
import { currentUser } from "./auth-client";

const KEY = "ice-lite-posts";

function readLocal(): IcePost[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function loadFeed(): IcePost[] {
  const local = readLocal();
  return [...local, ...SEED_FEED].sort((a, b) => b.timestamp - a.timestamp);
}

export function createPost(content: string): IcePost {
  const user = currentUser();
  if (!user) throw new Error("Sign in to post.");
  const text = content.trim();
  if (text.length < 1) throw new Error("Write something first.");
  if (text.length > 2000) throw new Error("Keep it under 2000 characters.");
  const post: IcePost = {
    id: `lite-${Date.now()}`,
    content: text,
    author: user.email,
    authorName: user.name || user.email.split("@")[0],
    likes: 0,
    loves: 0,
    timestamp: Date.now() * 1e6,
    category: "Lite",
  };
  localStorage.setItem(KEY, JSON.stringify([post, ...readLocal()]));
  return post;
}

export function deletePost(id: string) {
  const user = currentUser();
  if (!user) throw new Error("Sign in to delete a post.");
  const local = readLocal();
  const post = local.find((p) => p.id === id);
  if (!post) throw new Error("That post is not yours to delete.");
  if (post.author !== user.email) throw new Error("You can only delete your own posts.");
  localStorage.setItem(KEY, JSON.stringify(local.filter((p) => p.id !== id)));
}
