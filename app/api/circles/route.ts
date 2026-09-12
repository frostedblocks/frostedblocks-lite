import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { clientIp, publicError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { denyUnverified } from "@/lib/guard";

function slugify(name: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "circle";
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export async function GET(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ circles: [] });
    const q = sql();
    const rows = await q`SELECT c.id, c.slug, c.name, c.invite_token, c.owner_id, c.created_at, m.role
      FROM lite_circle_members m
      JOIN lite_circles c ON c.id = m.circle_id
      WHERE m.user_id = ${me.id}
      ORDER BY c.created_at DESC`;
    return NextResponse.json({
      circles: rows.map((r) => ({
        id: String(r.id),
        slug: r.slug,
        name: r.name,
        role: r.role,
        owner: Number(r.owner_id) === me.id,
        invitePath: `/c/${r.slug}?i=${r.invite_token}`,
        createdAt: r.created_at,
      })),
    });
  } catch {
    return publicError(500, "Could not load circles.");
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const limited = await rateLimit(`circle-create:${clientIp(req)}:${me!.id}`, 10, 60 * 60);
    if (!limited.ok) {
      const res = publicError(429, "Too many rooms created. Try later.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim().slice(0, 60);
    if (name.length < 2) return publicError(400, "Name needs at least 2 characters.");
    const slug = slugify(name);
    const invite = randomBytes(16).toString("hex");
    const q = sql();
    const rows = await q`INSERT INTO lite_circles (slug, name, owner_id, invite_token)
      VALUES (${slug}, ${name}, ${me!.id}, ${invite})
      RETURNING id, slug, name, invite_token, owner_id, created_at`;
    const c = rows[0];
    await q`INSERT INTO lite_circle_members (circle_id, user_id, role)
      VALUES (${c.id}, ${me!.id}, ${"owner"})`;
    return NextResponse.json({
      circle: {
        id: String(c.id),
        slug: c.slug,
        name: c.name,
        role: "owner",
        owner: true,
        invitePath: `/c/${c.slug}?i=${c.invite_token}`,
        createdAt: c.created_at,
      },
    });
  } catch {
    return publicError(500, "Could not create circle.");
  }
}
