import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { publicError } from "@/lib/http";

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const slug = String(ctx.params.slug || "").toLowerCase();
    const invite = new URL(req.url).searchParams.get("i") || "";
    const me = await userFromRequest(req).catch(() => null);
    const q = sql();
    const rows = await q`SELECT id, slug, name, owner_id, invite_token, created_at
      FROM lite_circles WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) return publicError(404, "Circle not found.");
    const c = rows[0];
    let role: string | null = null;
    if (me) {
      const mem = await q`SELECT role FROM lite_circle_members
        WHERE circle_id = ${c.id} AND user_id = ${me.id} LIMIT 1`;
      role = mem[0]?.role || null;
    }
    const inviteOk = Boolean(invite) && invite === c.invite_token;
    if (!role && !inviteOk) {
      return publicError(403, "Invite required. Ask for the guest link.");
    }
    return NextResponse.json({
      circle: {
        id: String(c.id),
        slug: c.slug,
        name: c.name,
        role,
        owner: me ? Number(c.owner_id) === me.id : false,
        member: Boolean(role),
        canJoin: !role && inviteOk && Boolean(me),
        invitePath: role === "owner" || Number(c.owner_id) === me?.id ? `/c/${c.slug}?i=${c.invite_token}` : null,
        createdAt: c.created_at,
      },
    });
  } catch {
    return publicError(500, "Could not load circle.");
  }
}
