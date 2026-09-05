import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, checkPassword } from "@/lib/password";
import { userFromRequest } from "@/lib/session";
import { isPwnedPassword } from "@/lib/pwned";

export async function POST(req: Request) {
  try {
    const { currentPassword, password, token } = await req.json();
    const next = String(password || "");
    if (next.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    if (await isPwnedPassword(next)) {
      return NextResponse.json({ error: "That password showed up in a public leak. Pick a different one." }, { status: 400 });
    }
    const q = sql();

    if (token) {
      const rows = await q`SELECT user_id FROM lite_email_tokens
        WHERE token = ${String(token)} AND kind = ${"reset"} AND expires_at > NOW()`;
      if (!rows.length) return NextResponse.json({ error: "That reset link is old or wrong." }, { status: 400 });
      await q`UPDATE lite_users SET password_hash = ${hashPassword(next)}, failed_attempts = 0, locked_until = NULL WHERE id = ${rows[0].user_id}`;
      await q`DELETE FROM lite_email_tokens WHERE token = ${String(token)}`;
      return NextResponse.json({ ok: true });
    }

    const me = await userFromRequest(req);
    if (!me) {
      return NextResponse.json({ error: "Use the email reset link, or sign in to change your password." }, { status: 401 });
    }
    const rows = await q`SELECT password_hash FROM lite_users WHERE id = ${me.id}`;
    if (!rows.length || !checkPassword(String(currentPassword || ""), rows[0].password_hash)) {
      return NextResponse.json({ error: "Current password is wrong." }, { status: 401 });
    }
    await q`UPDATE lite_users SET password_hash = ${hashPassword(next)}, failed_attempts = 0, locked_until = NULL WHERE id = ${me.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not change password.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
