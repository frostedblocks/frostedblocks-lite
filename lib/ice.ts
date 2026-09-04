import type { IcePost } from "./types";

/** ICP client is off for Lite builds so Vercel stays Web2-only. */
export async function fetchRecentPosts(_limit = 20): Promise<IcePost[]> {
  return [];
}
