import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { denyUnverified } from "@/lib/guard";
import { cleanText } from "@/lib/text";
import { handleOf, publicName } from "@/lib/public";
import { publicError } from "@/lib/http";
import { putAvatar } from "@/lib/r2";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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
    content: row.content || "",
    author: handleOf(row.author_id),
    authorName: publicName(row.author_name),
    likes: 0,
    loves: 0,
    imageURL: row.image_url || null,
    timestamp: new Date(row.created_at).getTime() * 1e6,
    category: "Circle",
    source: "lite" as const,
    mine: myId ? Number(row.author_id) === myId : false,
  };
}

function looksLikeImage(buf: Buffer, type: string) {
  if (type === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  if (type === "image/png") return buf[0] === 0x89 && buf[1] === 0x50;
  if (type === "image/webp") return buf.slice(0, 4).toString() === "RIFF";
  return false;
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
    const rows = await q`SELECT p.id, p.author_id, p.content, p.image_url, p.created_at, u.name AS author_name
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

    const ctype = (req.headers.get("content-type") || "").toLowerCase();
    let text = "";
    let imageUrl: string | null = null;

    if (ctype.includes("multipart/form-data")) {
      const form = await req.formData();
      if (form.get("public") === "true" || form.get("toPublic") === "true") {
        return publicError(400, "Circle posts stay in the circle. Use the public feed to post publicly.");
      }
      text = cleanText(String(form.get("content") || ""));
      const file = form.get("file");
      if (file instanceof File) {
        const ext = TYPES[file.type];
        if (!ext) return publicError(400, "Use a JPG, PNG, or WEBP.");
        if (file.size > 2_000_000) return publicError(400, "Photo must be under 2MB.");
        const sniff = Buffer.from(await file.arrayBuffer());
        if (!looksLikeImage(sniff, file.type)) return publicError(400, "That file is not a photo.");
        const key = `circles/${mem.id}/${me!.id}/${randomBytes(16).toString("hex")}.${ext}`;
        imageUrl = await putAvatar(key, sniff, file.type);
      }
    } else {
      const body = await req.json().catch(() => ({}));
      // Hard rule: never accept a flag that writes into public lite_posts.
      if (body.public === true || body.toPublic === true) {
        return publicError(400, "Circle posts stay in the circle. Use the public feed to post publicly.");
      }
      text = cleanText(String(body.content || ""));
    }

    if (!imageUrl && !text) return publicError(400, "Add a photo or write something.");
    if (text.length > 2000) return publicError(400, "Keep it under 2000 characters.");

    const q = sql();
    const rows = await q`INSERT INTO lite_circle_posts (circle_id, author_id, content, image_url)
      VALUES (${mem.id}, ${me!.id}, ${text}, ${imageUrl})
      RETURNING id, author_id, content, image_url, created_at`;
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
