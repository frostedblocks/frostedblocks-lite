import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

/** Origins allowed to read aggregate Lite stats from ICE Network admin UI. */
const ALLOWED = new Set([
  "https://www.frostedblocks.com",
  "https://frostedblocks.com",
  "https://6hhqv-baaaa-aaaan-q6mxq-cai.icp0.io",
  "https://6hhqv-baaaa-aaaan-q6mxq-cai.raw.icp0.io",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED.has(origin) ? origin : "";
  const headers: Record<string, string> = {
    // Required so ICE Network (other origin) can read this response.
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Cache-Control": "public, max-age=30",
  };
  if (allow) {
    headers["Access-Control-Allow-Origin"] = allow;
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    headers["Vary"] = "Origin";
  }
  return headers;
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

/**
 * Public aggregate counts only — no emails, names, or IDs.
 * Used by ICE Network Lite ICE controls.
 */
export async function GET(req: Request) {
  const headers = corsHeaders(req);
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
