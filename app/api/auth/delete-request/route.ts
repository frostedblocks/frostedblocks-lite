import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { handleOf } from "@/lib/public";
import { sendMail } from "@/lib/mail";
import { clientIp, publicError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const SUPPORT_TO = process.env.SUPPORT_EMAIL || "hello@frostedblocks.com";

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");
    const limited = await rateLimit(`delete-req:${clientIp(req)}:${me.id}`, 3, 24 * 60 * 60);
    if (!limited.ok) {
      const res = publicError(429, "You already sent a delete request recently. We’ll email you.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }
    const body = await req.json().catch(() => ({}));
    const note = String(body.note || "").trim().slice(0, 1000);
    const login = me.email || me.phone || "(unknown)";
    const text = [
      "ICE Lite account deletion request",
      "",
      `Handle: ${handleOf(me.id)}`,
      `Login: ${login}`,
      `Name: ${me.name}`,
      `User id: ${me.id}`,
      note ? `Note from user:\n${note}` : "No extra note.",
      "",
      "Please delete this Lite account and confirm by email if possible.",
    ].join("\n");
    await sendMail(SUPPORT_TO, `Lite delete request · ${handleOf(me.id)}`, text);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete-request mail failed", err instanceof Error ? err.message : err);
    return publicError(500, "Could not send the delete request. Try again or email hello@frostedblocks.com.");
  }
}
