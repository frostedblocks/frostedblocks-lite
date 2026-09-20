import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { fetchRecentPosts } from "@/lib/ice";
import { cleanText } from "@/lib/text";
import { handleOf, publicName } from "@/lib/public";
import { publicError } from "@/lib/http";
import { denyUnverified } from "@/lib/guard";
import { denyIfBanned, getLiteAdmin, isPostHidden } from "@/lib/lite-admin";
import { trackFunnelEvent } from "@/lib/events";

function mapPost(row: any, myId?: number) {
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
    source: "lite" as const,
    mine: myId ? Number(row.author_id) === myId : false,
  };
}

export async function GET(req: Request) {
  const me = await userFromRequest(req).catch(() => null);
  const limit = Math.min(50, Math.max(1, Number(new URL(req.url).searchParams.get("limit") || 50)));
  const admin = await getLiteAdmin().catch(() => null);
  let network: Awaited<ReturnType<typeof fetchRecentPosts>> = [];
  try {
    network = await fetchRecentPosts(limit);
  } catch {
    network = [];
  }

  try {
    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT p.id, p.author_id, p.content, p.category, p.created_at,
      u.name AS author_name
      FROM lite_posts p JOIN lite_users u ON u.id = p.author_id
      ORDER BY p.created_at DESC LIMIT ${limit}`;
    const lite = rows
      .map((row) => mapPost(row, me?.id))
      .filter((p) => !(admin && isPostHidden(admin, p.id)));

    // Attach Lite-user likes onto bridged ICE Network posts
    let networkOut = network;
    if (network.length) {
      const keys = network.map((p) => String(p.id));
      const countRows = await q`SELECT post_key, COUNT(*)::int AS n
        FROM lite_network_likes WHERE post_key = ANY(${keys}) GROUP BY post_key`;
      const counts = new Map(countRows.map((r) => [String(r.post_key), Number(r.n ?? 0)]));
      let mine = new Set<string>();
      if (me?.id) {
        const mineRows = await q`SELECT post_key FROM lite_network_likes
          WHERE user_id = ${me.id} AND post_key = ANY(${keys})`;
        mine = new Set(mineRows.map((r) => String(r.post_key)));
      }
      networkOut = network.map((p) => {
        const liteLikes = counts.get(String(p.id)) || 0;
        return {
          ...p,
          liteLikes,
          likedByMe: mine.has(String(p.id)),
          likes: Number(p.likes || 0) + liteLikes,
        };
      });
    }

    const posts = [...lite, ...networkOut].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, limit);
    return NextResponse.json({ posts, networkCount: networkOut.length });
  } catch {
    return NextResponse.json({ posts: network, networkCount: network.length });
  }
}

export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    const blocked = await denyUnverified(me);
    if (blocked) return blocked;
    const banned = await denyIfBanned(me?.id);
    if (banned) return banned;
    const { content } = await req.json();
    const text = cleanText(String(content || ""));
    if (!text) return publicError(400, "Write something first.");
    if (text.length > 2000) return publicError(400, "Keep it under 2000 characters.");
    const q = sql();
    const rows = await q`INSERT INTO lite_posts (author_id, content, category)
      VALUES (${me!.id}, ${text}, ${"Lite"}) RETURNING id, author_id, content, category, created_at`;
    const countRows = await q`SELECT COUNT(*)::int AS n FROM lite_posts WHERE author_id = ${me!.id}`;
    if (Number(countRows[0]?.n ?? 0) === 1) {
      await trackFunnelEvent(me!.id, "first_post_created");
    }
    return NextResponse.json({
      post: mapPost({ ...rows[0], author_name: me!.name }, me!.id),
    });
  } catch {
    return publicError(500, "Could not post.");
  }
}

export async function DELETE(req: Request) {
  try {
    const me = await userFromRequest(req);
    const blocked = await denyUnverified(me);
    if (blocked) return blocked;
    const { id } = await req.json();
    const q = sql();
    const rows = await q`DELETE FROM lite_posts WHERE id = ${Number(id)} AND author_id = ${me!.id} RETURNING id`;
    if (!rows.length) return publicError(403, "You can only delete your own posts.");
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not delete.");
  }
}
