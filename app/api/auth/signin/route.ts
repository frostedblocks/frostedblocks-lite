import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { checkPassword } from "@/lib/password";

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
    const q = sql();
    const rows = await q`SELECT id, email, phone, name, avatar, password_hash, failed_attempts, locked_until FROM lite_users
      WHERE email = ${id} OR phone = ${id} LIMIT 1`;
    const user = rows[0];
    if (!user) return NextResponse.json({ error: "Email, phone, or password is wrong." }, { status: 401 });

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return NextResponse.json({ error: "Too many tries. Wait 15 minutes and try again." }, { status: 423 });
    }

    if (!checkPassword(pass, user.password_hash)) {
      const fails = Number(user.failed_attempts || 0) + 1;
      if (fails >= 5) {
        await q`UPDATE lite_users SET failed_attempts = ${fails}, locked_until = NOW() + INTERVAL '15 minutes' WHERE id = ${user.id}`;
        return NextResponse.json({ error: "Too many tries. Wait 15 minutes and try again." }, { status: 423 });
      }
      await q`UPDATE lite_users SET failed_attempts = ${fails} WHERE id = ${user.id}`;
      return NextResponse.json({ error: "Email, phone, or password is wrong." }, { status: 401 });
    }

    await q`UPDATE lite_users SET failed_attempts = 0, locked_until = NULL WHERE id = ${user.id}`;
    const token = randomBytes(24).toString("hex");
    await q`INSERT INTO lite_sessions (token, user_id) VALUES (${token}, ${user.id})`;
    const res = NextResponse.json({
      email: user.email || user.phone,
      name: user.name,
      avatar: user.avatar,
    });
    res.cookies.set("ice_lite_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign in failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
