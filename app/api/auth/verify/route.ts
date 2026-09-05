import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { appUrl } from "@/lib/mail";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const origin = appUrl();
  if (!token) return NextResponse.redirect(`${origin}/verify?error=missing`);
  try {
    await ensureSchema();
    const q = sql();
    const rows = await q`SELECT user_id FROM lite_email_tokens
      WHERE token = ${token} AND kind = ${"verify"} AND expires_at > NOW()`;
    if (!rows.length) return NextResponse.redirect(`${origin}/verify?error=bad`);
    await q`UPDATE lite_users SET email_verified = TRUE WHERE id = ${rows[0].user_id}`;
    await q`DELETE FROM lite_email_tokens WHERE token = ${token}`;
    return NextResponse.redirect(`${origin}/verify?ok=1`);
  } catch {
    return NextResponse.redirect(`${origin}/verify?error=bad`);
  }
}
