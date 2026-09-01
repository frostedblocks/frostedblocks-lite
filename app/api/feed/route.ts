import { NextResponse } from "next/server";
import { SEED_FEED } from "@/lib/seed-feed";

export const dynamic = "force-dynamic";

/** ICP read is off until lite.frostedblocks.com is live. */
export async function GET() {
  return NextResponse.json({ source: "lite", posts: SEED_FEED });
}
