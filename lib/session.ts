import { cookies } from "next/headers";
import { ensureSchema, sql } from "./db";

export type DbUser = {
  id: number;
  email: string | null;
  phone: string | null;
  name: string;
  avatar: string | null;
};

export function loginOf(user: { email: string | null; phone: string | null }) {
  return user.email || user.phone || "";
}

function rowUser(row: any): DbUser {
  return {
    id: Number(row.id),
    email: row.email,
    phone: row.phone,
    name: row.name,
    avatar: row.avatar,
  };
}

export async function userFromRequest(req?: Request): Promise<DbUser | null> {
  await ensureSchema();
  let token = "";
  if (req) {
    token =
      (req.headers.get("cookie") || "")
        .split(";")
        .map((p) => p.trim())
        .find((p) => p.startsWith("ice_lite_session="))
        ?.slice("ice_lite_session=".length) || "";
  } else {
    token = cookies().get("ice_lite_session")?.value || "";
  }
  if (!token) return null;
  const q = sql();
  const rows = await q`SELECT u.id, u.email, u.phone, u.name, u.avatar
    FROM lite_sessions s JOIN lite_users u ON u.id = s.user_id
    WHERE s.token = ${token} LIMIT 1`;
  return rows[0] ? rowUser(rows[0]) : null;
}

export async function findUserByLogin(login: string): Promise<DbUser | null> {
  await ensureSchema();
  const raw = String(login || "").trim();
  if (!raw) return null;
  const q = sql();
  const handle = raw.match(/^u(\d+)$/i);
  if (handle) {
    const rows = await q`SELECT id, email, phone, name, avatar FROM lite_users WHERE id = ${Number(handle[1])} LIMIT 1`;
    return rows[0] ? rowUser(rows[0]) : null;
  }
  const rows = await q`SELECT id, email, phone, name, avatar FROM lite_users
    WHERE email = ${raw.toLowerCase()} OR phone = ${raw} LIMIT 1`;
  return rows[0] ? rowUser(rows[0]) : null;
}
