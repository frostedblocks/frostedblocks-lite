import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { handleOf, publicName } from "@/lib/public";
import { denyUnverified } from "@/lib/guard";
import { publicError } from "@/lib/http";
import { cleanText } from "@/lib/text";

function mapReply(row: any, myId?: number) {
  return {
    id: String(row.id),
    postId: String(row.post_id),
    author: handleOf(row.author_id),
    authorName: publicName(row.author_name),
    content: row.content,
    timestamp: new Date(row.created_at).getTime(),
    mine: myId ? Number(row.author_id) === myId : false,
  };
}

export async function GET(req: Request) {
  const postId = new URL(req.url).searchParams.get("post") || "";
  if (!postId) return NextResponse.json({ replies: [] });
  try {
    await ensureSchema();
    const me = await userFromRequest(req).catch(() => null);
    const q = sql();
    const rows = await q`SELECT r.id, r.post_id, r.author_id, r.content, r.created_at, u.name AS author_name
      FROM lite_replies r JOIN lite_users u ON u.id = r.author_id
      WHERE r.post_id = ${postId}
      ORDER BY r.created_at ASC LIMIT 100`;
    return NextResponse.json({ replies: rows.map((row) => mapReply(row, me?.id)) });
  } catch {
    return NextResponse.json({ replies: [] });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const body = await req.json();
    const postId = String(body.postId || "").slice(0, 80);
    const text = cleanText(String(body.content || ""));
    if (!postId) return publicError(400, "Missing post.");
    if (!text) return publicError(400, "Write a reply first.");
    if (text.length > 1000) return publicError(400, "Keep replies under 1000 characters.");
    const q = sql();
    const rows = await q`INSERT INTO lite_replies (post_id, author_id, content)
      VALUES (${postId}, ${me!.id}, ${text})
      RETURNING id, post_id, author_id, content, created_at`;
    return NextResponse.json({
      reply: mapReply({ ...rows[0], author_name: me!.name }, me!.id),
    });
  } catch {
    return publicError(500, "Could not reply.");
  }
}

export async function DELETE(req: Request) {
  try {
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const { id } = await req.json();
    const q = sql();
    const rows = await q`DELETE FROM lite_replies WHERE id = ${Number(id)} AND author_id = ${me!.id} RETURNING id`;
    if (!rows.length) return publicError(403, "You can only delete your own reply.");
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not delete reply.");
  }
}
