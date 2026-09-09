import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { deletePrefix, putAvatar } from "@/lib/r2";
import { userFromRequest } from "@/lib/session";
import { sql } from "@/lib/db";
import { publicError } from "@/lib/http";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return publicError(400, "Pick a photo.");
    const ext = TYPES[file.type];
    if (!ext) return publicError(400, "Use a JPG, PNG, or WEBP.");
    if (file.size > 2_000_000) return publicError(400, "Photo must be under 2MB.");
    const sniff = Buffer.from(await file.arrayBuffer());
    if (!looksLikeImage(sniff, file.type)) return publicError(400, "That file is not a photo.");
    const key = `avatars/${me.id}/${randomBytes(16).toString("hex")}.${ext}`;
    const url = await putAvatar(key, sniff, file.type);
    const q = sql();
    await q`UPDATE lite_users SET avatar = ${url} WHERE id = ${me.id}`;
    return NextResponse.json({ url });
  } catch {
    return publicError(500, "Upload failed.");
  }
}

export async function DELETE(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");
    try {
      await deletePrefix(`avatars/${me.id}/`);
    } catch {
      /* still clear */
    }
    const q = sql();
    await q`UPDATE lite_users SET avatar = NULL WHERE id = ${me.id}`;
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not delete.");
  }
}

function looksLikeImage(buf: Buffer, type: string) {
  if (type === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  if (type === "image/png") return buf[0] === 0x89 && buf[1] === 0x50;
  if (type === "image/webp") return buf.slice(0, 4).toString() === "RIFF";
  return false;
}
