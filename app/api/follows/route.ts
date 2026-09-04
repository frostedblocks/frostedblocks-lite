import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { findUserByLogin, loginOf, userFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ following: [], followers: [] });
    const q = sql();
    const following = await q`SELECT COALESCE(u.email, u.phone) AS target, u.name AS targetName
      FROM lite_follows f JOIN lite_users u ON u.id = f.followee_id
      WHERE f.follower_id = ${me.id}`;
    const followers = await q`SELECT COALESCE(u.email, u.phone) AS follower, u.name AS followerName
      FROM lite_follows f JOIN lite_users u ON u.id = f.follower_id
      WHERE f.followee_id = ${me.id}`;
    return NextResponse.json({
      following: following.map((r) => ({ follower: loginOf(me), target: r.target, targetName: r.targetname || r.targetName, source: "lite" })),
      followers: followers.map((r) => ({ follower: r.follower, target: loginOf(me), targetName: r.followername || r.followerName, source: "lite" })),
    });
  } catch {
    return NextResponse.json({ following: [], followers: [] });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ error: "Sign in to follow someone." }, { status: 401 });
    const { target } = await req.json();
    const other = await findUserByLogin(String(target || ""));
    if (!other) return NextResponse.json({ error: "That Lite user was not found." }, { status: 404 });
    if (other.id === me.id) return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
    const q = sql();
    await q`INSERT INTO lite_follows (follower_id, followee_id)
      VALUES (${me.id}, ${other.id}) ON CONFLICT DO NOTHING`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Follow failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const { target } = await req.json();
    const other = await findUserByLogin(String(target || ""));
    if (!other) return NextResponse.json({ ok: true });
    const q = sql();
    await q`DELETE FROM lite_follows WHERE follower_id = ${me.id} AND followee_id = ${other.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unfollow failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
