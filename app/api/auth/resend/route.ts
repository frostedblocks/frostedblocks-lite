import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { appUrl, sendMail } from "@/lib/mail";
import { needsEmailVerify, userFromRequest } from "@/lib/session";
import { publicError } from "@/lib/http";
import { checkRateLimit, recordRateHit } from "@/lib/rate-limit";
import { hashToken, newEmailToken } from "@/lib/token";

const WINDOW_SEC = 60 * 60;
const MAX_OK_SENDS = 8;

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");
    if (!me.email) return publicError(400, "This account has no email to confirm.");
    if (!needsEmailVerify(me)) {
      return NextResponse.json({ ok: true, alreadyVerified: true, mailed: false });
    }

    // User-scoped key (v4): failed attempts no longer burn the budget; old resend:ip:id locks are ignored.
    const rateKey = `confirm-mail:v4:${me.id}`;
    const limited = await checkRateLimit(rateKey, MAX_OK_SENDS, WINDOW_SEC);
    if (!limited.ok) {
      return publicError(
        429,
        `Wait about ${Math.ceil(limited.retryAfter / 60)} minutes before asking for another email.`,
      );
    }

    const token = newEmailToken();
    const q = sql();
    await q`DELETE FROM lite_email_tokens WHERE user_id = ${me.id} AND kind = ${"verify"}`;
    await q`INSERT INTO lite_email_tokens (token, user_id, kind, expires_at)
      VALUES (${hashToken(token)}, ${me.id}, ${"verify"}, NOW() + INTERVAL '2 days')`;

    try {
      await sendMail(
        me.email,
        "Confirm your ICE Lite email",
        `Confirm this email for ICE Lite:\n${appUrl()}/verify?token=${token}\n\nOpen the link, then tap Confirm my email.\n\nIf you did not ask, ignore this.`,
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "mail failed";
      console.error("resend mail failed", detail);
      // Do not recordRateHit — failures must not lock the user out.
      return publicError(500, `Could not send that email yet. ${detail.slice(0, 140)}`);
    }

    await recordRateHit(rateKey, WINDOW_SEC);
    return NextResponse.json({ ok: true, mailed: true });
  } catch {
    return publicError(500, "Could not send that email yet.");
  }
}
