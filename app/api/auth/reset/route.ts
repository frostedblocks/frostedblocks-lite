import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";

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
    if (pass.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    const q = sql();
    const rows = await q`UPDATE lite_users SET password_hash = ${hashPassword(pass)}
      WHERE email = ${id} OR phone = ${id}
      RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: "No Lite account with that email or phone." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reset failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
