import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { publicError } from "@/lib/http";
import {
  mapProfileLinkRow,
  normalizeProfileLinkUrl,
  sanitizeProfileLinkLabel,
} from "@/lib/profile-links";
import { userFromRequest } from "@/lib/session";

export const runtime = "nodejs";

function parseId(raw: string) {
  const id = Number(String(raw || "").trim());
  if (!Number.isFinite(id) || id < 1) return null;
  return id;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");

    const id = parseId(params.id);
    if (!id) return publicError(404, "Link not found.");

    await ensureSchema();
    const q = sql();
    const existing = await q`
      SELECT id, label, url, sort_order FROM lite_profile_links
      WHERE id = ${id} AND user_id = ${me.id}
      LIMIT 1`;
    if (!existing[0]) return publicError(404, "Link not found.");

    const body = await req.json().catch(() => ({}));
    const nextLabel =
      body.label !== undefined
        ? sanitizeProfileLinkLabel(body.label)
        : sanitizeProfileLinkLabel(existing[0].label);
    let nextUrl = String(existing[0].url);
    if (body.url !== undefined) {
      const checked = normalizeProfileLinkUrl(String(body.url || ""));
      if (checked.ok === false) {
        return publicError(400, checked.error);
      }
      nextUrl = checked.url;
    }

    const updated = await q`
      UPDATE lite_profile_links
      SET label = ${nextLabel}, url = ${nextUrl}
      WHERE id = ${id} AND user_id = ${me.id}
      RETURNING id, label, url, sort_order`;
    const row = updated[0];
    if (!row) return publicError(404, "Link not found.");

    return NextResponse.json({
      link: mapProfileLinkRow({
        id: row.id,
        label: row.label,
        url: row.url,
        sort_order: row.sort_order,
      }),
    });
  } catch {
    return publicError(500, "Could not update link.");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const me = await userFromRequest(_req);
    if (!me) return publicError(401, "Sign in first.");

    const id = parseId(params.id);
    if (!id) return publicError(404, "Link not found.");

    await ensureSchema();
    const q = sql();
    const deleted = await q`
      DELETE FROM lite_profile_links
      WHERE id = ${id} AND user_id = ${me.id}
      RETURNING id`;
    if (!deleted[0]) return publicError(404, "Link not found.");

    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not delete link.");
  }
}
