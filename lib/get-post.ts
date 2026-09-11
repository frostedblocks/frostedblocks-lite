import { SEED_FEED } from "./seed-feed";
import { ensureSchema, sql } from "./db";
import { fetchRecentPosts } from "./ice";
import { handleOf, publicName } from "./public";
import type { IcePost } from "./types";

export function mapLiteRow(row: any, myId?: number): IcePost {
  return {
    id: String(row.id),
    content: row.content,
    author: handleOf(row.author_id),
    authorName: publicName(row.author_name),
    likes: 0,
    loves: 0,
    imageURL: null,
    timestamp: new Date(row.created_at).getTime() * 1e6,
    category: row.category || "Lite",
    source: "lite",
    mine: myId ? Number(row.author_id) === myId : false,
  };
}

export function postPath(id: string) {
  return `/p/${encodeURIComponent(id)}`;
}

export function postUrl(id: string) {
  return `https://lite.frostedblocks.com${postPath(id)}`;
}

export async function getPost(id: string): Promise<IcePost | null> {
  const raw = decodeURIComponent(String(id || "")).trim();
  if (!raw) return null;

  const seed = SEED_FEED.find((p) => p.id === raw);
  if (seed) return seed;

  try {
    const network = await fetchRecentPosts(50);
    const hit = network.find((p) => p.id === raw || p.id === `network-${raw}` || p.id.replace(/^network-/, "") === raw);
    if (hit) return hit;
  } catch {
    /* fall through */
  }

  if (!/^\d+$/.test(raw)) return null;

  try {
    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT p.id, p.author_id, p.content, p.category, p.created_at,
      u.name AS author_name
      FROM lite_posts p JOIN lite_users u ON u.id = p.author_id
      WHERE p.id = ${Number(raw)} LIMIT 1`;
    if (rows[0]) return mapLiteRow(rows[0]);
  } catch {
    /* missing db */
  }
  return null;
}
