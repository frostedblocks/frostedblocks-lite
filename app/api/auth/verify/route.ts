import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { appUrl } from "@/lib/mail";
import { hashToken } from "@/lib/token";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const origin = appUrl();
  if (!token) return NextResponse.redirect(`${origin}/verify?error=missing`);
  try {
    await ensureSchema();
    const q = sql();
    const dig = hashToken(token);
    // Accept hashed tokens; also legacy plain tokens issued before hashing.
    const rows = await q`SELECT token, user_id FROM lite_email_tokens
      WHERE (token = ${dig} OR token = ${token}) AND kind = ${"verify"} AND expires_at > NOW()`;
    if (!rows.length) return NextResponse.redirect(`${origin}/verify?error=bad`);
    await q`UPDATE lite_users SET email_verified = TRUE WHERE id = ${rows[0].user_id}`;
    await q`DELETE FROM lite_email_tokens WHERE token = ${rows[0].token}`;
    return NextResponse.redirect(`${origin}/verify?ok=1`);
  } catch {
    return NextResponse.redirect(`${origin}/verify?error=bad`);
  }
}
