import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT COALESCE(email, phone) AS email, name, avatar, created_at
      FROM lite_users ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({
      people: rows.map((r) => ({
        email: r.email,
        name: r.name,
        avatar: r.avatar,
        source: "lite",
        joined: r.created_at,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "People list failed.";
    return NextResponse.json({ error: message, people: [] }, { status: 200 });
  }
}
