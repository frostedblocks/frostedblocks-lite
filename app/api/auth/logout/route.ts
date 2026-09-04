import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const token = (await req.headers.get("cookie") || "")
      .split(";")
      .map((p) => p.trim())
      .find((p) => p.startsWith("ice_lite_session="))
      ?.slice("ice_lite_session=".length);
    if (token) {
      const q = sql();
      await q`DELETE FROM lite_sessions WHERE token = ${token}`;
    }
  } catch {
    /* still clear cookie */
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ice_lite_session", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
