import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { appUrl, sendMail } from "@/lib/mail";
import { clientIp, publicError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { isEmail, normalizeLogin } from "@/lib/login";

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return publicError(503, "Reset email is not set up. Add RESEND_API_KEY on Vercel.");
    }
    await ensureSchema();
    const { login } = await req.json();
    const id = normalizeLogin(String(login || ""));
    if (!isEmail(id)) {
      return publicError(400, "Use the email on the account. Phone-only accounts cannot reset this way.");
    }
    const limited = await rateLimit(`forgot:${clientIp(req)}:${id}`, 5, 60 * 60);
    if (!limited.ok) {
      const res = publicError(429, "Too many reset attempts. Try later.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }
    const q = sql();
    const rows = await q`SELECT id, email FROM lite_users WHERE email = ${id} LIMIT 1`;
    if (rows[0]?.email) {
      const token = randomBytes(24).toString("hex");
      await q`DELETE FROM lite_email_tokens WHERE user_id = ${rows[0].id} AND kind = ${"reset"}`;
      await q`INSERT INTO lite_email_tokens (token, user_id, kind, expires_at)
        VALUES (${token}, ${rows[0].id}, ${"reset"}, NOW() + INTERVAL '2 hours')`;
      try {
        await sendMail(
          rows[0].email,
          "Reset your ICE Lite password",
          `Reset your ICE Lite password:\n${appUrl()}/reset?token=${token}\n\nThis link lasts 2 hours. If you did not ask, ignore this.`,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not send email.";
        console.error("reset mail failed", message);
        return publicError(503, message);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start a reset.";
    console.error("forgot failed", message);
    return publicError(500, "Could not start a reset.");
  }
}
