import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { iceCorsHeaders } from "@/lib/cors-ice";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: iceCorsHeaders(req) });
}

/**
 * Public aggregate counts only — no emails, names, or IDs.
 * Used by ICE Network Lite ICE controls.
 */
export async function GET(req: Request) {
  const headers = iceCorsHeaders(req);
  try {
    await ensureSchema();
    const q = sql();
    const [users, posts] = await Promise.all([
      q`SELECT COUNT(*)::int AS n FROM lite_users`,
      q`SELECT COUNT(*)::int AS n FROM lite_posts`,
    ]);
    return NextResponse.json(
      {
        registeredUsers: Number(users[0]?.n ?? 0),
        posts: Number(posts[0]?.n ?? 0),
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Stats unavailable.", registeredUsers: null, posts: null },
      { status: 500, headers },
    );
  }
}
