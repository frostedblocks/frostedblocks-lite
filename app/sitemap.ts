import type { MetadataRoute } from "next";
import { ensureSchema, sql } from "@/lib/db";
import { postPath } from "@/lib/post-url";

/** Public marketing URLs + real Lite post permalinks. Demo seeds stay out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://lite.frostedblocks.com";
  const staticPaths = ["", "/feed", "/about", "/join", "/terms", "/privacy", "/contact", "/signup"];
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "daily" as const,
    priority: path === "" || path === "/feed" ? 1 : 0.6,
  }));

  try {
    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT id, created_at FROM lite_posts
      WHERE COALESCE(category, ${"Lite"}) <> ${"Demo"}
        AND content NOT LIKE ${"[Demo]%"}
      ORDER BY created_at DESC
      LIMIT ${1000}`;
    for (const row of rows) {
      entries.push({
        url: `${base}${postPath(String(row.id))}`,
        lastModified: new Date(row.created_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    /* DB unavailable at build/runtime — keep static URLs */
  }

  return entries;
}
