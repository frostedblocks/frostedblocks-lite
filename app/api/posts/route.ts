import { NextResponse } from "next/server";
import { SEED_FEED } from "@/lib/seed-feed";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { fetchRecentPosts } from "@/lib/ice";
import { cleanText } from "@/lib/text";
import { handleOf, publicName } from "@/lib/public";
import { publicError } from "@/lib/http";
import { denyUnverified } from "@/lib/guard";

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
    const lite = rows.map((row) => mapPost(row, me?.id));
    const extra = network.length ? [] : SEED_FEED;
    const posts = [...lite, ...network, ...extra].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, limit);
    return NextResponse.json({ posts, networkCount: network.length });
  } catch {
    const posts = network.length ? network : SEED_FEED;
    return NextResponse.json({ posts, networkCount: network.length });
  }
}

export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const { content } = await req.json();
    const text = cleanText(String(content || ""));
    if (!text) return publicError(400, "Write something first.");
    if (text.length > 2000) return publicError(400, "Keep it under 2000 characters.");
    const q = sql();
    const rows = await q`INSERT INTO lite_posts (author_id, content, category)
      VALUES (${me!.id}, ${text}, ${"Lite"}) RETURNING id, author_id, content, category, created_at`;
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
    const blocked = denyUnverified(me);
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
