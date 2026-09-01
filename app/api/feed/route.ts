import { NextResponse } from "next/server";
import { fetchRecentPosts } from "@/lib/ice";
import { SEED_FEED } from "@/lib/seed-feed";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const posts = await fetchRecentPosts(20);
    if (!posts.length) return NextResponse.json({ source: "seed", posts: SEED_FEED });
    return NextResponse.json({ source: "ice", posts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "query failed";
    return NextResponse.json({ source: "seed", error: message, posts: SEED_FEED });
  }
}
