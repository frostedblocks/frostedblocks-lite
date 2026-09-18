import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { handleOf, publicName } from "@/lib/public";
import { getLiteAdmin, isPostHidden } from "@/lib/lite-admin";
import { iceCorsHeaders } from "@/lib/cors-ice";

/**
 * Lite-only posts for ICE Network feed (read-only pull).
 * Does not include on-chain ICE Network posts — avoids echo loops.
 */
export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: iceCorsHeaders(req) });
}

export async function GET(req: Request) {
  const headers = iceCorsHeaders(req, 45);
  const limit = Math.min(
    40,
    Math.max(1, Number(new URL(req.url).searchParams.get("limit") || 25)),
  );

  try {
    await ensureSchema();
    const admin = await getLiteAdmin().catch(() => null);
    const q = sql();
    const rows = await q`SELECT p.id, p.author_id, p.content, p.category, p.created_at,
      u.name AS author_name
      FROM lite_posts p JOIN lite_users u ON u.id = p.author_id
      ORDER BY p.created_at DESC LIMIT ${limit}`;

    const posts = rows
      .map((row) => ({
        id: `lite-${row.id}`,
        content: String(row.content || ""),
        authorHandle: handleOf(row.author_id),
        authorName: publicName(row.author_name),
        category: row.category || "Lite",
        timestamp: new Date(row.created_at).getTime() * 1e6,
        source: "lite" as const,
        url: `https://lite.frostedblocks.com/p/${row.id}`,
      }))
      .filter((p) => {
        if (!admin) return true;
        const rawId = String(p.id).replace(/^lite-/, "");
        return !isPostHidden(admin, rawId) && !isPostHidden(admin, p.id);
      });

    return NextResponse.json({ posts, source: "lite" }, { headers });
  } catch {
    return NextResponse.json(
      { posts: [], source: "lite", error: "unavailable" },
      { status: 500, headers },
    );
  }
}
