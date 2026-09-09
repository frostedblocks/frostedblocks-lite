import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { appUrl, sendMail } from "@/lib/mail";
import { isPwnedPassword } from "@/lib/pwned";
import { clientIp, publicError, sessionCookie } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

function normalize(login: string) {
  const value = login.trim();
  if (value.includes("@")) return value.toLowerCase();
  const keepPlus = value.startsWith("+") ? "+" : "";
  return keepPlus + value.replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const { login, password, name } = await req.json();
    const id = normalize(String(login || ""));
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
    const email = id.includes("@") && id.includes(".") ? id : null;
    const phone = /^\+?\d{10,15}$/.test(id) ? id : null;
    if (!email && !phone) return publicError(400, "Use an email or a phone number.");

    const q = sql();
    const existing = email
      ? await q`SELECT id FROM lite_users WHERE email = ${email}`
      : await q`SELECT id FROM lite_users WHERE phone = ${phone}`;
    if (existing.length) return publicError(400, "Could not create that account.");

    const display = String(name || "").trim() || (email ? email.split("@")[0] : "Lite user");
    const rows = await q`INSERT INTO lite_users (email, phone, name, password_hash, email_verified)
      VALUES (${email}, ${phone}, ${display}, ${hashPassword(pass)}, ${false})
      RETURNING id, email, phone, name, avatar`;
    const user = rows[0];
    const session = randomBytes(32).toString("hex");
    await q`INSERT INTO lite_sessions (token, user_id) VALUES (${session}, ${user.id})`;

    if (email) {
      const verify = randomBytes(24).toString("hex");
      await q`INSERT INTO lite_email_tokens (token, user_id, kind, expires_at)
        VALUES (${verify}, ${user.id}, ${"verify"}, NOW() + INTERVAL '2 days')`;
      try {
        await sendMail(
          email,
          "Confirm your ICE Lite email",
          `Confirm this email for ICE Lite:\n${appUrl()}/verify?token=${verify}\n\nIf you did not sign up, ignore this.`,
        );
      } catch {
        /* do not leak mail status */
      }
    }

    const res = NextResponse.json({
      email: user.email || user.phone,
      name: user.name,
      avatar: user.avatar,
      mailed: Boolean(email),
    });
    return sessionCookie(res, session);
  } catch {
    return publicError(500, "Sign up failed.");
  }
}
