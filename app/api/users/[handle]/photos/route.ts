import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { GALLERY_CAP } from "@/lib/gallery";
import { publicError } from "@/lib/http";
import { handleOf, isLiteHandle, publicName } from "@/lib/public";
import { userFromRequest } from "@/lib/session";

export const runtime = "nodejs";

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
    const rows = await q`SELECT id, name, avatar FROM lite_users WHERE id = ${userId} LIMIT 1`;
    if (!rows[0]) return publicError(404, "User not found.");

    const user = rows[0];
    const avatar = user.avatar ? String(user.avatar) : null;
    const photoRows = await q`
      SELECT id, url, created_at
      FROM lite_gallery_photos
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${GALLERY_CAP}`;

    const photos = photoRows.map((row) => {
      const url = String(row.url);
      return {
        id: String(row.id),
        url,
        createdAt: row.created_at || null,
        isProfile: Boolean(avatar && avatar === url),
      };
    });

    // Legacy: profile avatar uploaded via /api/avatar before gallery existed.
    if (avatar && !photos.some((p) => p.url === avatar)) {
      photos.unshift({
        id: "avatar",
        url: avatar,
        createdAt: null,
        isProfile: true,
      });
    }

    return NextResponse.json({
      profile: {
        handle: handleOf(user.id),
        name: publicName(user.name),
        avatar,
        me: me ? Number(user.id) === me.id : false,
      },
      photos,
      cap: GALLERY_CAP,
    });
  } catch {
    return publicError(500, "Could not load photos.");
  }
}
