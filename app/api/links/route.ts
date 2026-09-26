import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { publicError } from "@/lib/http";
import {
  PROFILE_LINKS_CAP,
  mapProfileLinkRow,
  normalizeProfileLinkUrl,
  sanitizeProfileLinkLabel,
} from "@/lib/profile-links";
import { userFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");

    await ensureSchema();
    const q = sql();
    const countRows = await q`
      SELECT COUNT(*)::int AS n FROM lite_profile_links WHERE user_id = ${me.id}`;
    const count = Number(countRows[0]?.n || 0);
    if (count >= PROFILE_LINKS_CAP) {
      return publicError(400, `Link list is full (${PROFILE_LINKS_CAP}). Delete one first.`);
    }

    const body = await req.json().catch(() => ({}));
    const label = sanitizeProfileLinkLabel(body.label);
    const checked = normalizeProfileLinkUrl(String(body.url || ""));
    if (checked.ok === false) {
      return publicError(400, checked.error);
    }
    const safeUrl = checked.url;

    const orderRows = await q`
      SELECT COALESCE(MAX(sort_order), -1)::int AS m
      FROM lite_profile_links WHERE user_id = ${me.id}`;
    const sortOrder = Number(orderRows[0]?.m ?? -1) + 1;

    const inserted = await q`
      INSERT INTO lite_profile_links (user_id, label, url, sort_order)
      VALUES (${me.id}, ${label}, ${safeUrl}, ${sortOrder})
      RETURNING id, label, url, sort_order, created_at`;
    const row = inserted[0];
    if (!row) return publicError(500, "Could not save link.");

    return NextResponse.json({
      link: mapProfileLinkRow({
        id: row.id,
        label: row.label,
        url: row.url,
        sort_order: row.sort_order,
      }),
      cap: PROFILE_LINKS_CAP,
    });
  } catch {
    return publicError(500, "Could not save link.");
  }
}
