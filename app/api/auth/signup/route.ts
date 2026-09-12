import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { appUrl, sendMail } from "@/lib/mail";
import { isPwnedPassword } from "@/lib/pwned";
import { clientIp, publicError, sessionCookie } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { isEmail, normalizeLogin } from "@/lib/login";
import { hashToken, newEmailToken } from "@/lib/token";

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const { login, password, name } = await req.json();
    const id = normalizeLogin(String(login || ""));
    const pass = String(password || "");
    const ip = clientIp(req);
    const limited = await rateLimit(`signup:${ip}`, 5, 60 * 60);
    if (!limited.ok) {
      const res = publicError(429, "Too many new accounts from here. Try later.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }
    if (pass.length < 8) return publicError(400, "Password must be at least 8 characters.");
    if (await isPwnedPassword(pass)) {
      return publicError(400, "That password showed up in a public leak. Pick a different one.");
    }
    if (!isEmail(id)) {
      return publicError(400, "New accounts need an email. Phone signup is closed.");
    }
    const email = id;

    const q = sql();
    const existing = await q`SELECT id FROM lite_users WHERE email = ${email}`;
    if (existing.length) return publicError(400, "Could not create that account.");

    const display = String(name || "").trim() || email.split("@")[0] || "Lite user";
    const rows = await q`INSERT INTO lite_users (email, phone, name, password_hash, email_verified)
      VALUES (${email}, ${null}, ${display}, ${hashPassword(pass)}, ${false})
      RETURNING id, email, phone, name, avatar`;
    const user = rows[0];
    const session = randomBytes(32).toString("hex");
    await q`INSERT INTO lite_sessions (token, user_id) VALUES (${session}, ${user.id})`;

    let mailed = false;
    const verify = newEmailToken();
    await q`INSERT INTO lite_email_tokens (token, user_id, kind, expires_at)
      VALUES (${hashToken(verify)}, ${user.id}, ${"verify"}, NOW() + INTERVAL '2 days')`;
    try {
      await sendMail(
        email,
        "Confirm your ICE Lite email",
        `Confirm this email for ICE Lite:\n${appUrl()}/api/auth/verify?token=${verify}\n\nIf you did not sign up, ignore this.`,
      );
      mailed = true;
    } catch (err) {
      console.error("signup mail failed", err instanceof Error ? err.message : err);
    }

    const res = NextResponse.json({
      email: user.email || user.phone,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      mailed,
    });
    return sessionCookie(res, session);
  } catch {
    return publicError(500, "Sign up failed.");
  }
}
