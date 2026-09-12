import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { userFromRequest } from "@/lib/session";
import { checkPassword } from "@/lib/password";
import { deletePrefix } from "@/lib/r2";
import { clientIp, publicError, sessionCookie } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in first.");

    const limited = await rateLimit(`delete-account:${clientIp(req)}:${me.id}`, 5, 60 * 60);
    if (!limited.ok) {
      const res = publicError(429, "Too many delete attempts. Try later.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }

    const body = await req.json().catch(() => ({}));
    const confirm = String(body.confirm || "").trim();
    if (confirm !== "DELETE") {
      return publicError(400, "Type DELETE in capitals to confirm.");
    }

    const password = String(body.password || "");
    const q = sql();
    const rows = await q`SELECT password_hash FROM lite_users WHERE id = ${me.id} LIMIT 1`;
    if (!rows.length) return publicError(404, "Account not found.");

    // Password accounts must prove they know the password. Google-only accounts
    // (random unusable hash) can omit password and rely on session + DELETE.
    if (password) {
      if (!checkPassword(password, rows[0].password_hash)) {
        return publicError(401, "Password is wrong.");
      }
    }

    try {
      await deletePrefix(`avatars/${me.id}/`);
    } catch {
      /* still wipe the row */
    }

    await q`DELETE FROM lite_users WHERE id = ${me.id}`;

    return sessionCookie(NextResponse.json({ ok: true }), null);
  } catch (err) {
    console.error("account delete failed", err instanceof Error ? err.message : err);
    return publicError(500, "Could not delete the account. Try again or email hello@frostedblocks.com.");
  }
}
