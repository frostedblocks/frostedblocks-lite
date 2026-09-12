import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { denyUnverified } from "@/lib/guard";
import { clientIp, publicError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request, ctx: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const limited = await rateLimit(`circle-join:${clientIp(req)}:${me!.id}`, 30, 60 * 60);
    if (!limited.ok) {
      const res = publicError(429, "Too many join attempts. Try later.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }
    const slug = String(ctx.params.slug || "").toLowerCase();
    const body = await req.json().catch(() => ({}));
    const invite = String(body.invite || "").trim();
    const q = sql();
    const rows = await q`SELECT id, invite_token FROM lite_circles WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) return publicError(404, "Circle not found.");
    if (!invite || invite !== rows[0].invite_token) {
      return publicError(403, "That invite link is wrong or expired.");
    }
    await q`INSERT INTO lite_circle_members (circle_id, user_id, role)
      VALUES (${rows[0].id}, ${me!.id}, ${"member"})
      ON CONFLICT (circle_id, user_id) DO NOTHING`;
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not join circle.");
  }
}
