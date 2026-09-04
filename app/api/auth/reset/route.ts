import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, checkPassword } from "@/lib/password";
import { userFromRequest } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) {
      return NextResponse.json(
        { error: "Sign in first to change your password. Email reset links are not on yet." },
        { status: 401 },
      );
    }
    const { currentPassword, password } = await req.json();
    const next = String(password || "");
    if (next.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    const q = sql();
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
