import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { checkPassword } from "@/lib/password";
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
    const { login, password } = await req.json();
    const id = normalize(String(login || ""));
    const pass = String(password || "");
    const ip = clientIp(req);
    const limited = await rateLimit(`signin:${ip}:${id}`, 8, 15 * 60);
    if (!limited.ok) {
      const res = publicError(429, "Too many tries. Wait and try again.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }
    const q = sql();
    const rows = await q`SELECT id, email, phone, name, avatar, password_hash, failed_attempts, locked_until FROM lite_users
      WHERE email = ${id} OR phone = ${id} LIMIT 1`;
    const user = rows[0];
    const generic = "Email, phone, or password is wrong.";
    if (!user) return publicError(401, generic);

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return publicError(423, "Too many tries. Wait 15 minutes and try again.");
    }

    if (!checkPassword(pass, user.password_hash)) {
      const fails = Number(user.failed_attempts || 0) + 1;
      if (fails >= 5) {
        await q`UPDATE lite_users SET failed_attempts = ${fails}, locked_until = NOW() + INTERVAL '15 minutes' WHERE id = ${user.id}`;
        return publicError(423, "Too many tries. Wait 15 minutes and try again.");
      }
      await q`UPDATE lite_users SET failed_attempts = ${fails} WHERE id = ${user.id}`;
      return publicError(401, generic);
    }

    await q`UPDATE lite_users SET failed_attempts = 0, locked_until = NULL WHERE id = ${user.id}`;
    await q`DELETE FROM lite_sessions WHERE user_id = ${user.id}`;
    const token = randomBytes(32).toString("hex");
    await q`INSERT INTO lite_sessions (token, user_id) VALUES (${token}, ${user.id})`;
    const res = NextResponse.json({
      email: user.email || user.phone,
      name: user.name,
      avatar: user.avatar,
    });
    return sessionCookie(res, token);
  } catch {
    return publicError(500, "Sign in failed.");
  }
}
