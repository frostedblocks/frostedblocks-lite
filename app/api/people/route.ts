import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { handleOf, publicName } from "@/lib/public";
import { userFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const q = sql();
    const rows = await q`SELECT id, name, avatar, created_at FROM lite_users ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({
      people: rows.map((r) => ({
        handle: handleOf(r.id),
        name: publicName(r.name),
        avatar: r.avatar,
        source: "lite",
        joined: r.created_at,
        me: me ? Number(r.id) === me.id : false,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "People list failed.";
    return NextResponse.json({ error: message, people: [] }, { status: 200 });
  }
}
