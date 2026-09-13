import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { denyUnverified } from "@/lib/guard";
import { publicError } from "@/lib/http";
import { publicName } from "@/lib/public";

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const slug = String(ctx.params.slug || "").toLowerCase();
    const invite = new URL(req.url).searchParams.get("i") || "";
    const me = await userFromRequest(req).catch(() => null);
    const q = sql();
    const rows = await q`SELECT id, slug, name, purpose, owner_id, invite_token, created_at
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

    let members: { id: string; name: string; role: string; owner: boolean }[] = [];
    if (role) {
      const people = await q`SELECT u.id, u.name, m.role, m.joined_at
        FROM lite_circle_members m
        JOIN lite_users u ON u.id = m.user_id
        WHERE m.circle_id = ${c.id}
        ORDER BY CASE WHEN m.role = ${"owner"} THEN 0 ELSE 1 END, m.joined_at ASC`;
      members = people.map((p) => ({
        id: String(p.id),
        name: publicName(p.name),
        role: String(p.role || "member"),
        owner: Number(p.id) === Number(c.owner_id),
      }));
    }

    return NextResponse.json({
      circle: {
        id: String(c.id),
        slug: c.slug,
        name: c.name,
        purpose: c.purpose || null,
        role,
        owner: me ? Number(c.owner_id) === me.id : false,
        member: Boolean(role),
        canJoin: !role && inviteOk && Boolean(me),
        invitePath:
          role === "owner" || Number(c.owner_id) === me?.id
            ? `/c/${c.slug}?i=${c.invite_token}`
            : null,
        createdAt: c.created_at,
        members,
      },
    });
  } catch {
    return publicError(500, "Could not load circle.");
  }
}

/** Owner-only: permanently delete the circle, members, and private posts (CASCADE). */
export async function DELETE(req: Request, ctx: { params: { slug: string } }) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;

    const slug = String(ctx.params.slug || "").toLowerCase();
    const body = await req.json().catch(() => ({}));
    const confirm = String((body as { confirm?: string }).confirm || "").trim();

    const q = sql();
    const rows = await q`SELECT id, name, owner_id FROM lite_circles WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) return publicError(404, "Circle not found.");
    const c = rows[0];
    if (Number(c.owner_id) !== me!.id) {
      return publicError(403, "Only the room owner can delete this circle.");
    }
    if (confirm !== "DELETE" && confirm !== String(c.name)) {
      return publicError(400, "Type DELETE or the exact room name to confirm.");
    }

    // Members + posts cascade via FK ON DELETE CASCADE.
    await q`DELETE FROM lite_circles WHERE id = ${c.id} AND owner_id = ${me!.id}`;
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not delete that circle.");
  }
}
