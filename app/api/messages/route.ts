import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { findUserByLogin, loginOf, userFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ error: "Sign in to message." }, { status: 401 });
    const otherLogin = new URL(req.url).searchParams.get("with") || "";
    const q = sql();
    if (!otherLogin) {
      const rows = await q`SELECT m.id, m.body, m.created_at,
        COALESCE(s.email, s.phone) AS sender, COALESCE(r.email, r.phone) AS receiver
        FROM lite_messages m
        JOIN lite_users s ON s.id = m.sender_id
        JOIN lite_users r ON r.id = m.receiver_id
        WHERE m.sender_id = ${me.id} OR m.receiver_id = ${me.id}
        ORDER BY m.created_at DESC LIMIT 200`;
      return NextResponse.json({ messages: rows.map(mapMsg) });
    }
    const other = await findUserByLogin(otherLogin);
    if (!other) return NextResponse.json({ messages: [] });
    const rows = await q`SELECT m.id, m.body, m.created_at,
      COALESCE(s.email, s.phone) AS sender, COALESCE(r.email, r.phone) AS receiver
      FROM lite_messages m
      JOIN lite_users s ON s.id = m.sender_id
      JOIN lite_users r ON r.id = m.receiver_id
      WHERE (m.sender_id = ${me.id} AND m.receiver_id = ${other.id})
         OR (m.sender_id = ${other.id} AND m.receiver_id = ${me.id})
      ORDER BY m.created_at ASC`;
    return NextResponse.json({ messages: rows.map(mapMsg) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Messages failed.";
    return NextResponse.json({ error: message, messages: [] }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ error: "Sign in to send a message." }, { status: 401 });
    const { to, text } = await req.json();
    const body = String(text || "").trim().slice(0, 2000);
    if (!body) return NextResponse.json({ error: "Write a message first." }, { status: 400 });
    const other = await findUserByLogin(String(to || ""));
    if (!other) return NextResponse.json({ error: "That Lite user was not found." }, { status: 404 });
    if (other.id === me.id) return NextResponse.json({ error: "You cannot message yourself." }, { status: 400 });
    const q = sql();
    const rows = await q`INSERT INTO lite_messages (sender_id, receiver_id, body)
      VALUES (${me.id}, ${other.id}, ${body}) RETURNING id, created_at`;
    return NextResponse.json({
      message: {
        id: String(rows[0].id),
        from: loginOf(me),
        to: loginOf(other),
        text: body,
        at: new Date(rows[0].created_at).getTime(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function mapMsg(row: any) {
  return {
    id: String(row.id),
    from: row.sender,
    to: row.receiver,
    text: row.body,
    at: new Date(row.created_at).getTime(),
  };
}
