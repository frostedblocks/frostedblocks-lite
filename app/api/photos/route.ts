import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { GALLERY_CAP, GALLERY_TYPES, looksLikeImage } from "@/lib/gallery";
import { publicError } from "@/lib/http";
import { putAvatar } from "@/lib/r2";
import { userFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");

    await ensureSchema();
    const q = sql();
    const countRows = await q`
      SELECT COUNT(*)::int AS n FROM lite_gallery_photos WHERE user_id = ${me.id}`;
    const count = Number(countRows[0]?.n || 0);
    if (count >= GALLERY_CAP) {
      return publicError(400, `Gallery is full (${GALLERY_CAP} photos). Delete one first.`);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return publicError(400, "Pick a photo.");
    const ext = GALLERY_TYPES[file.type];
    if (!ext) return publicError(400, "Use a JPG, PNG, or WEBP.");
    if (file.size > 2_000_000) return publicError(400, "Photo must be under 2MB.");
    const sniff = Buffer.from(await file.arrayBuffer());
    if (!looksLikeImage(sniff, file.type)) return publicError(400, "That file is not a photo.");

    const key = `gallery/${me.id}/${randomBytes(16).toString("hex")}.${ext}`;
    const url = await putAvatar(key, sniff, file.type);

    const inserted = await q`
      INSERT INTO lite_gallery_photos (user_id, url)
      VALUES (${me.id}, ${url})
      RETURNING id, url, created_at`;
    const row = inserted[0];
    if (!row) return publicError(500, "Upload failed.");

    const urlObj = new URL(req.url);
    const setProfileFlag =
      urlObj.searchParams.get("setProfile") === "1" ||
      form.get("setProfile") === "1" ||
      form.get("setProfile") === "true";
    const shouldSetProfile = setProfileFlag || count === 0 || !me.avatar;

    if (shouldSetProfile) {
      await q`UPDATE lite_users SET avatar = ${url} WHERE id = ${me.id}`;
    }

    return NextResponse.json({
      photo: {
        id: String(row.id),
        url: String(row.url),
        createdAt: row.created_at || null,
        isProfile: shouldSetProfile,
      },
      avatar: shouldSetProfile ? url : me.avatar || null,
      cap: GALLERY_CAP,
    });
  } catch {
    return publicError(500, "Upload failed.");
  }
}
