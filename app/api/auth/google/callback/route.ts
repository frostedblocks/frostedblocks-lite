import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { sessionCookie } from "@/lib/http";
import { normalizeLogin } from "@/lib/login";
import { publicName } from "@/lib/public";

export async function GET(req: Request) {
  const here = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${here.protocol}//${here.host}`;
  const code = here.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/signin?error=google`);

  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) return NextResponse.redirect(`${origin}/signin?error=google-config`);

  try {
    await ensureSchema();
    const redirectUri = `${origin}/api/auth/google/callback`;
    const body = new URLSearchParams({
      code,
      client_id: id,
      client_secret: secret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) return NextResponse.redirect(`${origin}/signin?error=google-token`);

    const meRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const me = await meRes.json();
    const email = normalizeLogin(String(me.email || ""));
    if (!email) return NextResponse.redirect(`${origin}/signin?error=google-email`);

    const display = publicName(me.name, email.split("@")[0] || "Lite user");
    const picture = typeof me.picture === "string" && me.picture.startsWith("https://") ? me.picture : null;
    const q = sql();
    const existing = await q`SELECT id, name, avatar FROM lite_users WHERE email = ${email} LIMIT 1`;

    let userId: number;
    if (existing.length) {
      userId = Number(existing[0].id);
      const nextName = existing[0].name || display;
      const nextAvatar = existing[0].avatar || picture;
      await q`UPDATE lite_users
        SET email_verified = TRUE,
            name = ${nextName},
            avatar = ${nextAvatar}
        WHERE id = ${userId}`;
    } else {
      const unusable = hashPassword(randomBytes(32).toString("hex"));
      const rows = await q`INSERT INTO lite_users (email, phone, name, password_hash, avatar, email_verified)
        VALUES (${email}, ${null}, ${display}, ${unusable}, ${picture}, ${true})
        RETURNING id`;
      userId = Number(rows[0].id);
    }

    const session = randomBytes(32).toString("hex");
    await q`INSERT INTO lite_sessions (token, user_id) VALUES (${session}, ${userId})`;

    // No email/name/picture in the URL — session cookie carries auth.
    const res = NextResponse.redirect(`${origin}/auth/google`);
    return sessionCookie(res, session);
  } catch {
    return NextResponse.redirect(`${origin}/signin?error=google`);
  }
}
