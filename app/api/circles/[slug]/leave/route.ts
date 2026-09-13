import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { denyUnverified } from "@/lib/guard";
import { publicError } from "@/lib/http";

/** Non-owner members leave the room. Owners must Delete room instead. */
export async function POST(req: Request, ctx: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;

    const slug = String(ctx.params.slug || "").toLowerCase();
    const q = sql();
    const rows = await q`SELECT id, owner_id, name FROM lite_circles WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) return publicError(404, "Circle not found.");
    const c = rows[0];

    if (Number(c.owner_id) === me!.id) {
      return publicError(400, "Owners can’t leave. Delete the room if you’re done with it.");
    }

    const mem = await q`DELETE FROM lite_circle_members
      WHERE circle_id = ${c.id} AND user_id = ${me!.id}
      RETURNING user_id`;
    if (!mem.length) return publicError(403, "You’re not in this circle.");

    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not leave that circle.");
  }
}
