import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { findUserByLogin, userFromRequest } from "@/lib/session";
import { handleOf, publicName } from "@/lib/public";
import { denyUnverified } from "@/lib/guard";
import { publicError } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ following: [], followers: [] });
    const q = sql();
    const following = await q`SELECT u.id, u.name
      FROM lite_follows f JOIN lite_users u ON u.id = f.followee_id
      WHERE f.follower_id = ${me.id}`;
    const followers = await q`SELECT u.id, u.name
      FROM lite_follows f JOIN lite_users u ON u.id = f.follower_id
      WHERE f.followee_id = ${me.id}`;
    return NextResponse.json({
      following: following.map((r) => ({
        follower: handleOf(me.id),
        target: handleOf(r.id),
        targetName: publicName(r.name),
        source: "lite",
      })),
      followers: followers.map((r) => ({
        follower: handleOf(r.id),
        target: handleOf(me.id),
        targetName: publicName(r.name),
        source: "lite",
      })),
    });
  } catch {
    return NextResponse.json({ following: [], followers: [] });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const { target } = await req.json();
    const other = await findUserByLogin(String(target || ""));
    if (!other) return publicError(404, "That Lite user was not found.");
    if (other.id === me!.id) return publicError(400, "You cannot follow yourself.");
    const q = sql();
    await q`INSERT INTO lite_follows (follower_id, followee_id)
      VALUES (${me!.id}, ${other.id}) ON CONFLICT DO NOTHING`;
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Follow failed.");
  }
}

export async function DELETE(req: Request) {
  try {
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const { target } = await req.json();
    const other = await findUserByLogin(String(target || ""));
    if (!other) return NextResponse.json({ ok: true });
    const q = sql();
    await q`DELETE FROM lite_follows WHERE follower_id = ${me!.id} AND followee_id = ${other.id}`;
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Unfollow failed.");
  }
}
