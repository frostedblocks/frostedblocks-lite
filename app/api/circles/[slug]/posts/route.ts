import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { denyUnverified } from "@/lib/guard";
import { cleanText } from "@/lib/text";
import { handleOf, publicName } from "@/lib/public";
import { publicError } from "@/lib/http";

async function requireMember(slug: string, userId: number) {
  const q = sql();
  const rows = await q`SELECT c.id, c.name, c.slug, m.role
    FROM lite_circles c
    JOIN lite_circle_members m ON m.circle_id = c.id AND m.user_id = ${userId}
    WHERE c.slug = ${slug}
    LIMIT 1`;
  return rows[0] || null;
}

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
    category: "Circle",
    source: "lite" as const,
    mine: myId ? Number(row.author_id) === myId : false,
  };
}

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");
    const slug = String(ctx.params.slug || "").toLowerCase();
    const mem = await requireMember(slug, me.id);
    if (!mem) return publicError(403, "Join this circle to see posts.");
    const q = sql();
    const rows = await q`SELECT p.id, p.author_id, p.content, p.created_at, u.name AS author_name
      FROM lite_circle_posts p
      JOIN lite_users u ON u.id = p.author_id
      WHERE p.circle_id = ${mem.id}
      ORDER BY p.created_at DESC
      LIMIT 100`;
    return NextResponse.json({ posts: rows.map((r) => mapPost(r, me.id)) });
  } catch {
    return publicError(500, "Could not load circle posts.");
  }
}

export async function POST(req: Request, ctx: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const slug = String(ctx.params.slug || "").toLowerCase();
    const mem = await requireMember(slug, me!.id);
    if (!mem) return publicError(403, "Join this circle to post here.");
    const body = await req.json().catch(() => ({}));
    // Hard rule: never accept a flag that writes into public lite_posts.
    if (body.public === true || body.toPublic === true) {
      return publicError(400, "Circle posts stay in the circle. Use the public feed to post publicly.");
    }
    const text = cleanText(String(body.content || ""));
    if (!text) return publicError(400, "Write something first.");
    if (text.length > 2000) return publicError(400, "Keep it under 2000 characters.");
    const q = sql();
    const rows = await q`INSERT INTO lite_circle_posts (circle_id, author_id, content)
      VALUES (${mem.id}, ${me!.id}, ${text})
      RETURNING id, author_id, content, created_at`;
    return NextResponse.json({
      post: mapPost({ ...rows[0], author_name: me!.name }, me!.id),
    });
  } catch {
    return publicError(500, "Could not post to circle.");
  }
}

export async function DELETE(req: Request, ctx: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const slug = String(ctx.params.slug || "").toLowerCase();
    const mem = await requireMember(slug, me!.id);
    if (!mem) return publicError(403, "Not a member of this circle.");
    const { id } = await req.json();
    const q = sql();
    const rows = await q`DELETE FROM lite_circle_posts
      WHERE id = ${Number(id)} AND circle_id = ${mem.id} AND author_id = ${me!.id}
      RETURNING id`;
    if (!rows.length) return publicError(403, "You can only delete your own circle posts.");
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not delete.");
  }
}
