import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Legacy Network bridge endpoint.
 * Lite no longer surfaces on-chain ICE Network posts on its own feed.
 */
export async function GET() {
  return NextResponse.json({ source: "network", posts: [], cached: false, disabled: true });
}
