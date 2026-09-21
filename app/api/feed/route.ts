import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Legacy Network bridge — disabled. Lite feed is Lite-only. */
export async function GET() {
  return NextResponse.json({
    source: "network",
    posts: [],
    cached: false,
    disabled: true,
  });
}
