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
  const next = [post, ...readLocal()];
  localStorage.setItem(KEY, JSON.stringify(next));
  return post;
}
