import { NextResponse } from "next/server";
import { fetchRecentPosts } from "@/lib/ice";
import { ensureSchema, sql } from "@/lib/db";
import { cleanText } from "@/lib/text";

export const dynamic = "force-dynamic";

function item(title: string, link: string, body: string, date: Date) {
  return `<item><title>${esc(title)}</title><link>${esc(link)}</link><description>${esc(body)}</description><pubDate>${date.toUTCString()}</pubDate></item>`;
}

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const parts: string[] = [];
  try {
    const network = await fetchRecentPosts(20);
    for (const p of network) {
      const ms = p.timestamp > 1e14 ? p.timestamp / 1e6 : p.timestamp;
      parts.push(item(p.authorName, "https://www.frostedblocks.com", cleanText(p.content).slice(0, 280), new Date(ms)));
    }
  } catch {}
  try {
    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT p.content, p.created_at, u.name FROM lite_posts p JOIN lite_users u ON u.id = p.author_id ORDER BY p.created_at DESC LIMIT 20`;
    for (const row of rows) {
      parts.push(item(row.name, "https://lite.frostedblocks.com/feed", cleanText(row.content).slice(0, 280), new Date(row.created_at)));
    }
  } catch {}
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>ICE Lite</title><link>https://lite.frostedblocks.com</link><description>Quiet social hybrid feed</description>${parts.join("")}</channel></rss>`;
  return new NextResponse(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
