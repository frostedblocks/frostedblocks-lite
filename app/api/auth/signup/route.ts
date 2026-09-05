import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { appUrl, sendMail } from "@/lib/mail";
import { isPwnedPassword } from "@/lib/pwned";

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
    if (pass.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (await isPwnedPassword(pass)) {
      return NextResponse.json({ error: "That password showed up in a public leak. Pick a different one." }, { status: 400 });
    }
    const email = id.includes("@") && id.includes(".") ? id : null;
    const phone = /^\+?\d{10,15}$/.test(id) ? id : null;
    if (!email && !phone) return NextResponse.json({ error: "Use an email or a phone number." }, { status: 400 });

    const q = sql();
    const existing = email
      ? await q`SELECT id FROM lite_users WHERE email = ${email}`
      : await q`SELECT id FROM lite_users WHERE phone = ${phone}`;
    if (existing.length) return NextResponse.json({ error: "That account already exists." }, { status: 409 });

    const display = String(name || "").trim() || (email ? email.split("@")[0] : id.slice(-4));
    const rows = await q`INSERT INTO lite_users (email, phone, name, password_hash, email_verified)
      VALUES (${email}, ${phone}, ${display}, ${hashPassword(pass)}, ${false})
      RETURNING id, email, phone, name, avatar`;
    const user = rows[0];
    const session = randomBytes(24).toString("hex");
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
      } catch (err) {
        console.error(err);
      }
    }

    const res = NextResponse.json({
      email: user.email || user.phone,
      name: user.name,
      avatar: user.avatar,
      mailed: Boolean(email),
    });
    res.cookies.set("ice_lite_session", session, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
