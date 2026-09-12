import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { publicName } from "@/lib/public";
import { clientIp, publicError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");
    const limited = await rateLimit(`profile:${clientIp(req)}:${me.id}`, 20, 60 * 60);
    if (!limited.ok) {
      const res = publicError(429, "Too many profile changes. Try later.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }
    const body = await req.json().catch(() => ({}));
    const raw = String(body.name || "").trim().slice(0, 40);
    if (raw.length < 2) return publicError(400, "Name needs at least 2 characters.");
    if (raw.includes("@")) return publicError(400, "Use a display name, not an email.");
    const name = publicName(raw, "Lite user");
    if (name === "Lite user" && raw.toLowerCase() !== "lite user") {
      return publicError(400, "That name is not allowed.");
    }
    const q = sql();
    await q`UPDATE lite_users SET name = ${name} WHERE id = ${me.id}`;
    return NextResponse.json({
      name,
      login: me.email || me.phone || "",
      avatar: me.avatar,
    });
  } catch {
    return publicError(500, "Could not update profile.");
  }
}
