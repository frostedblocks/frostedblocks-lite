import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { handleOf, isLiteHandle, publicName } from "@/lib/public";
import { publicError } from "@/lib/http";
import { getLiteAdmin, isPostHidden } from "@/lib/lite-admin";

function mapPost(row: any, myId?: number) {
  const avatar = row.author_avatar ? String(row.author_avatar) : "";
  return {
    id: String(row.id),
    content: row.content,
    author: handleOf(row.author_id),
    authorName: publicName(row.author_name),
    authorAvatar: avatar || null,
    likes: 0,
    loves: 0,
    imageURL: null,
    timestamp: new Date(row.created_at).getTime() * 1e6,
    category: row.category || "Lite",
    source: "lite" as const,
    mine: myId ? Number(row.author_id) === myId : false,
  };
}

export async function GET(
  req: Request,
  { params }: { params: { handle: string } },
) {
  try {
    await ensureSchema();
    const handle = String(params.handle || "").trim();
    if (!isLiteHandle(handle)) return publicError(404, "User not found.");
    const userId = Number(handle.slice(1));
    if (!Number.isFinite(userId) || userId < 1) return publicError(404, "User not found.");

    const me = await userFromRequest(req).catch(() => null);
    const q = sql();
    const rows = await q`SELECT id, name, avatar, created_at FROM lite_users
      WHERE id = ${userId} LIMIT 1`;
    if (!rows[0]) return publicError(404, "User not found.");

    const user = rows[0];
    const postRows = await q`SELECT p.id, p.author_id, p.content, p.category, p.created_at,
      u.name AS author_name, u.avatar AS author_avatar
      FROM lite_posts p JOIN lite_users u ON u.id = p.author_id
      WHERE p.author_id = ${userId}
      ORDER BY p.created_at DESC LIMIT 50`;
    const admin = await getLiteAdmin().catch(() => null);
    const posts = postRows
      .map((row) => mapPost(row, me?.id))
      .filter((p) => !(admin && isPostHidden(admin, p.id)));

    return NextResponse.json({
      profile: {
        handle: handleOf(user.id),
        name: publicName(user.name),
        avatar: user.avatar || null,
        joined: user.created_at || null,
        me: me ? Number(user.id) === me.id : false,
      },
      posts,
    });
  } catch {
    return publicError(500, "Could not load profile.");
  }
}
