import { NextResponse } from "next/server";
import { fetchRecentPosts } from "@/lib/ice";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const posts = await fetchRecentPosts(50);
    const me = await userFromRequest(req).catch(() => null);
    try {
      await ensureSchema();
      const q = sql();
      const keys = posts.map((p) => String(p.id));
      if (keys.length) {
        const countRows = await q`SELECT post_key, COUNT(*)::int AS n
          FROM lite_network_likes WHERE post_key = ANY(${keys}) GROUP BY post_key`;
        const counts = new Map(countRows.map((r) => [String(r.post_key), Number(r.n ?? 0)]));
        let mine = new Set<string>();
        if (me?.id) {
          const mineRows = await q`SELECT post_key FROM lite_network_likes
            WHERE user_id = ${me.id} AND post_key = ANY(${keys})`;
          mine = new Set(mineRows.map((r) => String(r.post_key)));
        }
        const enriched = posts.map((p) => {
          const liteLikes = counts.get(String(p.id)) || 0;
          return {
            ...p,
            liteLikes,
            likedByMe: mine.has(String(p.id)),
            likes: Number(p.likes || 0) + liteLikes,
          };
        });
        return NextResponse.json({ source: "network", posts: enriched, cached: true });
      }
    } catch {
      /* return unenriched */
    }
    return NextResponse.json({ source: "network", posts, cached: true });
  } catch {
    return NextResponse.json({ source: "network", posts: [], cached: false });
  }
}
