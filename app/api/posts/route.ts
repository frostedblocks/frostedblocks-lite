import { NextResponse } from "next/server";
import { SEED_FEED } from "@/lib/seed-feed";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { fetchRecentPosts } from "@/lib/ice";
import { cleanText } from "@/lib/text";
import { handleOf, publicName } from "@/lib/public";

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
  let network: Awaited<ReturnType<typeof fetchRecentPosts>> = [];
  try {
    network = await fetchRecentPosts(50);
  } catch (err) {
    console.error("ICE Network feed failed", err);
  }

  try {
    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT p.id, p.author_id, p.content, p.category, p.created_at,
      u.name AS author_name
      FROM lite_posts p JOIN lite_users u ON u.id = p.author_id
      ORDER BY p.created_at DESC LIMIT 50`;
    const lite = rows.map((row) => mapPost(row, me?.id));
    const extra = network.length ? [] : SEED_FEED;
    const posts = [...lite, ...network, ...extra].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    return NextResponse.json({ posts, networkCount: network.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Feed failed.";
    const posts = network.length ? network : SEED_FEED;
    return NextResponse.json({ error: message, posts, networkCount: network.length }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ error: "Sign in to post." }, { status: 401 });
    const { content } = await req.json();
    const text = cleanText(String(content || ""));
    if (!text) return NextResponse.json({ error: "Write something first." }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "Keep it under 2000 characters." }, { status: 400 });
    const q = sql();
    const rows = await q`INSERT INTO lite_posts (author_id, content, category)
      VALUES (${me.id}, ${text}, ${"Lite"}) RETURNING id, author_id, content, category, created_at`;
    return NextResponse.json({
      post: mapPost({ ...rows[0], author_name: me.name }, me.id),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ error: "Sign in to delete." }, { status: 401 });
    const { id } = await req.json();
    const q = sql();
    const rows = await q`DELETE FROM lite_posts WHERE id = ${Number(id)} AND author_id = ${me.id} RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: "You can only delete your own posts." }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
