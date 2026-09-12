import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { appUrl } from "@/lib/mail";
import { publicError } from "@/lib/http";
import { needsEmailVerify, userFromRequest } from "@/lib/session";
import { hashToken } from "@/lib/token";

/** Apply a verify token. Returns true if email_verified was set (or already set via this token). */
async function consumeVerifyToken(token: string): Promise<boolean> {
  if (!token) return false;
  await ensureSchema();
  const q = sql();
  const dig = hashToken(token);
  // Accept hashed tokens; also legacy plain tokens issued before hashing.
  const rows = await q`SELECT token, user_id FROM lite_email_tokens
    WHERE (token = ${dig} OR token = ${token}) AND kind = ${"verify"} AND expires_at > NOW()`;
  if (!rows.length) return false;
  await q`UPDATE lite_users SET email_verified = TRUE WHERE id = ${rows[0].user_id}`;
  await q`DELETE FROM lite_email_tokens WHERE token = ${rows[0].token}`;
  return true;
}

/**
 * Legacy email links hit GET /api/auth/verify?token=…
 * Do NOT consume on GET — mail scanners prefetch GET and burn one-time links.
 * Send humans to the tap-to-confirm page instead.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const origin = appUrl();
  if (!token) return NextResponse.redirect(`${origin}/verify?error=missing`);
  return NextResponse.redirect(`${origin}/verify?token=${encodeURIComponent(token)}`);
}

/** Human confirmation from the /verify button (POST). */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = String((body as { token?: string }).token || "");
    if (!token) return publicError(400, "Missing confirm token.");

    if (await consumeVerifyToken(token)) {
      return NextResponse.json({ ok: true });
    }

    // Token already used or expired — if this session is already verified, treat as success
    // (common after a mail scanner burned the link but the UPDATE still ran on an older GET).
    const me = await userFromRequest(req);
    if (me && !needsEmailVerify(me)) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    return publicError(400, "That confirm link is old or already used. Send a new one from the feed.");
  } catch {
    return publicError(500, "Could not confirm that email yet.");
  }
}
