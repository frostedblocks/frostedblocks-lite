import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { findUserByLogin, userFromRequest } from "@/lib/session";
import { handleOf, publicName } from "@/lib/public";
import { denyUnverified } from "@/lib/guard";
import { clientIp, publicError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return publicError(401, "Sign in to message.");
    const otherLogin = new URL(req.url).searchParams.get("with") || "";
    const q = sql();
    if (!otherLogin) {
      const rows = await q`SELECT m.id, m.body, m.created_at,
        s.id AS sid, s.name AS sname, r.id AS rid, r.name AS rname
        FROM lite_messages m
        JOIN lite_users s ON s.id = m.sender_id
        JOIN lite_users r ON r.id = m.receiver_id
        WHERE m.sender_id = ${me.id} OR m.receiver_id = ${me.id}
        ORDER BY m.created_at DESC LIMIT 200`;
      const readRows = await q`SELECT peer_id, last_read_at FROM lite_message_reads WHERE user_id = ${me.id}`;
      const reads: Record<string, number> = {};
      for (const row of readRows) {
        reads[handleOf(row.peer_id)] = new Date(row.last_read_at).getTime();
      }
      return NextResponse.json({ me: handleOf(me.id), messages: rows.map(mapMsg), reads });
    }
    const other = await findUserByLogin(otherLogin);
    if (!other) return NextResponse.json({ me: handleOf(me.id), messages: [], reads: {} });
    await q`INSERT INTO lite_message_reads (user_id, peer_id, last_read_at)
      VALUES (${me.id}, ${other.id}, NOW())
      ON CONFLICT (user_id, peer_id) DO UPDATE SET last_read_at = NOW()`;
    const rows = await q`SELECT m.id, m.body, m.created_at,
      s.id AS sid, s.name AS sname, r.id AS rid, r.name AS rname
      FROM lite_messages m
      JOIN lite_users s ON s.id = m.sender_id
      JOIN lite_users r ON r.id = m.receiver_id
      WHERE (m.sender_id = ${me.id} AND m.receiver_id = ${other.id})
         OR (m.sender_id = ${other.id} AND m.receiver_id = ${me.id})
      ORDER BY m.created_at ASC`;
    const reads = { [handleOf(other.id)]: Date.now() };
    return NextResponse.json({ me: handleOf(me.id), messages: rows.map(mapMsg), reads });
  } catch {
    return publicError(500, "Messages failed.");
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    const blocked = denyUnverified(me);
    if (blocked) return blocked;
    const limited = await rateLimit(`msg:${clientIp(req)}:${me!.id}`, 20, 15 * 60);
    if (!limited.ok) {
      const res = publicError(429, "Too many messages. Wait a few minutes.");
      res.headers.set("Retry-After", String(limited.retryAfter));
      return res;
    }
    const { to, text } = await req.json();
    const body = String(text || "").trim().slice(0, 2000);
    if (!body) return publicError(400, "Write a message first.");
    const other = await findUserByLogin(String(to || ""));
    if (!other) return publicError(404, "That Lite user was not found.");
    if (other.id === me!.id) return publicError(400, "You cannot message yourself.");
    const q = sql();
    const rows = await q`INSERT INTO lite_messages (sender_id, receiver_id, body)
      VALUES (${me!.id}, ${other.id}, ${body}) RETURNING id, created_at`;
    return NextResponse.json({
      message: {
        id: String(rows[0].id),
        from: handleOf(me!.id),
        fromName: publicName(me!.name),
        to: handleOf(other.id),
        toName: publicName(other.name),
        text: body,
        at: new Date(rows[0].created_at).getTime(),
      },
    });
  } catch {
    return publicError(500, "Send failed.");
  }
}

function mapMsg(row: any) {
  return {
    id: String(row.id),
    from: handleOf(row.sid),
    fromName: publicName(row.sname),
    to: handleOf(row.rid),
    toName: publicName(row.rname),
    text: row.body,
    at: new Date(row.created_at).getTime(),
  };
}
