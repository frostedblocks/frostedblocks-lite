import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { publicError } from "@/lib/http";
import { deleteAvatar, keyFromPublicUrl } from "@/lib/r2";
import { userFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");

    const idRaw = String(params.id || "").trim();
    // Legacy avatar-only tile (not in gallery table) — clear profile photo.
    if (idRaw === "avatar") {
      const q = sql();
      await ensureSchema();
      await q`UPDATE lite_users SET avatar = NULL WHERE id = ${me.id}`;
      return NextResponse.json({ ok: true, avatar: null });
    }

    const id = Number(idRaw);
    if (!Number.isFinite(id) || id < 1) return publicError(404, "Photo not found.");

    await ensureSchema();
    const q = sql();
    const rows = await q`
      SELECT id, url FROM lite_gallery_photos
      WHERE id = ${id} AND user_id = ${me.id}
      LIMIT 1`;
    if (!rows[0]) return publicError(404, "Photo not found.");

    const url = String(rows[0].url);
    const wasProfile = Boolean(me.avatar && me.avatar === url);

    await q`DELETE FROM lite_gallery_photos WHERE id = ${id} AND user_id = ${me.id}`;

    const key = keyFromPublicUrl(url);
    if (key) {
      try {
        await deleteAvatar(key);
      } catch {
        /* still removed from DB */
      }
    }

    let avatar: string | null = me.avatar || null;
    if (wasProfile) {
      const next = await q`
        SELECT url FROM lite_gallery_photos
        WHERE user_id = ${me.id}
        ORDER BY created_at DESC
        LIMIT 1`;
      avatar = next[0] ? String(next[0].url) : null;
      await q`UPDATE lite_users SET avatar = ${avatar} WHERE id = ${me.id}`;
    }

    return NextResponse.json({ ok: true, avatar });
  } catch {
    return publicError(500, "Could not delete photo.");
  }
}
