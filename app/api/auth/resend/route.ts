import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { appUrl, sendMail } from "@/lib/mail";
import { needsEmailVerify, userFromRequest } from "@/lib/session";
import { publicError } from "@/lib/http";
import { clientIp } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");
    if (!me.email) return publicError(400, "This account has no email to confirm.");
    if (!needsEmailVerify(me)) return NextResponse.json({ ok: true });
    const limited = await rateLimit(`resend:${clientIp(req)}:${me.id}`, 3, 60 * 60);
    if (!limited.ok) return publicError(429, "Wait before asking for another email.");
    const token = randomBytes(24).toString("hex");
    const q = sql();
    await q`DELETE FROM lite_email_tokens WHERE user_id = ${me.id} AND kind = ${"verify"}`;
    await q`INSERT INTO lite_email_tokens (token, user_id, kind, expires_at)
      VALUES (${token}, ${me.id}, ${"verify"}, NOW() + INTERVAL '2 days')`;
    await sendMail(
      me.email,
      "Confirm your ICE Lite email",
      `Confirm this email for ICE Lite:\n${appUrl()}/verify?token=${token}\n\nIf you did not ask, ignore this.`,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return publicError(500, "Could not send that email yet.");
  }
}
