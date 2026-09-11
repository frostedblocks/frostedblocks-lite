import { NextResponse } from "next/server";
import { fetchRecentPosts } from "@/lib/ice";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await fetchRecentPosts(50);
    return NextResponse.json({ source: "network", posts, cached: true });
  } catch {
    return NextResponse.json({ source: "network", posts: [], cached: false });
  }
}
