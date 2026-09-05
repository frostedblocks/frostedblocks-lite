import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { ensureSchema, sql } from "@/lib/db";
import { appUrl, sendMail } from "@/lib/mail";

function normalize(login: string) {
  const value = login.trim();
  if (value.includes("@")) return value.toLowerCase();
  const keepPlus = value.startsWith("+") ? "+" : "";
  return keepPlus + value.replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const { login } = await req.json();
    const id = normalize(String(login || ""));
    const q = sql();
    const rows = await q`SELECT id, email FROM lite_users WHERE email = ${id} LIMIT 1`;
    if (rows[0]?.email) {
      const token = randomBytes(24).toString("hex");
      await q`DELETE FROM lite_email_tokens WHERE user_id = ${rows[0].id} AND kind = ${"reset"}`;
      await q`INSERT INTO lite_email_tokens (token, user_id, kind, expires_at)
        VALUES (${token}, ${rows[0].id}, ${"reset"}, NOW() + INTERVAL '2 hours')`;
      await sendMail(
        rows[0].email,
        "Reset your ICE Lite password",
        `Reset your ICE Lite password:\n${appUrl()}/reset?token=${token}\n\nThis link lasts 2 hours. If you did not ask, ignore this.`,
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send reset email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
