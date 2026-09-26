import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { publicError } from "@/lib/http";
import { userFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");

    const id = Number(params.id);
    if (!Number.isFinite(id) || id < 1) return publicError(404, "Photo not found.");

    await ensureSchema();
    const q = sql();
    const rows = await q`
      SELECT id, url FROM lite_gallery_photos
      WHERE id = ${id} AND user_id = ${me.id}
      LIMIT 1`;
    if (!rows[0]) return publicError(404, "Photo not found.");

    const url = String(rows[0].url);
    await q`UPDATE lite_users SET avatar = ${url} WHERE id = ${me.id}`;

    return NextResponse.json({
      ok: true,
      avatar: url,
      photo: { id: String(rows[0].id), url, isProfile: true },
    });
  } catch {
    return publicError(500, "Could not set profile photo.");
  }
}
