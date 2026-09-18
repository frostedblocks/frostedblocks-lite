import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { publicError } from "@/lib/http";
import { denyUnverified } from "@/lib/guard";
import { denyIfBanned } from "@/lib/lite-admin";

function normalizeNetworkKey(raw: string) {
  const id = String(raw || "").trim();
  if (!id) return "";
  // Accept "network-123" or bare "123" from older clients
  if (id.startsWith("network-")) return id;
  if (/^\d+$/.test(id)) return `network-${id}`;
  return "";
}

/** Toggle or set like on a bridged ICE Network post. */
export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    const blocked = await denyUnverified(me);
    if (blocked) return blocked;
    const banned = await denyIfBanned(me?.id);
    if (banned) return banned;

    const body = await req.json().catch(() => ({}));
    const postKey = normalizeNetworkKey(String(body.postId || body.id || ""));
    if (!postKey) {
      return publicError(400, "Only ICE Network posts can be liked this way.");
    }

    await ensureSchema();
    const q = sql();
    const existing = await q`SELECT 1 FROM lite_network_likes
      WHERE user_id = ${me!.id} AND post_key = ${postKey} LIMIT 1`;

    let liked = false;
    if (existing.length) {
      await q`DELETE FROM lite_network_likes WHERE user_id = ${me!.id} AND post_key = ${postKey}`;
      liked = false;
    } else {
      await q`INSERT INTO lite_network_likes (user_id, post_key) VALUES (${me!.id}, ${postKey})
        ON CONFLICT DO NOTHING`;
      liked = true;
    }

    const countRows = await q`SELECT COUNT(*)::int AS n FROM lite_network_likes WHERE post_key = ${postKey}`;
    const liteLikes = Number(countRows[0]?.n ?? 0);

    return NextResponse.json({ ok: true, postId: postKey, liked, liteLikes });
  } catch {
    return publicError(500, "Could not update like.");
  }
}

/** Batch counts + liked-by-me for network post keys. */
export async function GET(req: Request) {
  try {
    const me = await userFromRequest(req).catch(() => null);
    const url = new URL(req.url);
    const raw = url.searchParams.get("ids") || "";
    const keys = raw
      .split(",")
      .map((s) => normalizeNetworkKey(s))
      .filter(Boolean)
      .slice(0, 80);

    if (!keys.length) {
      return NextResponse.json({ likes: {} });
    }

    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT post_key, COUNT(*)::int AS n
      FROM lite_network_likes
      WHERE post_key = ANY(${keys})
      GROUP BY post_key`;

    const likes: Record<string, { count: number; likedByMe: boolean }> = {};
    for (const k of keys) likes[k] = { count: 0, likedByMe: false };
    for (const r of rows) {
      likes[String(r.post_key)] = {
        count: Number(r.n ?? 0),
        likedByMe: false,
      };
    }

    if (me?.id) {
      const mine = await q`SELECT post_key FROM lite_network_likes
        WHERE user_id = ${me.id} AND post_key = ANY(${keys})`;
      for (const r of mine) {
        const k = String(r.post_key);
        if (likes[k]) likes[k].likedByMe = true;
      }
    }

    return NextResponse.json({ likes });
  } catch {
    return publicError(500, "Could not load likes.");
  }
}
