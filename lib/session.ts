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
  const row = rows[0];
  if (!row) return null;
  return {
    id: Number(row.id),
    email: row.email,
    phone: row.phone,
    name: row.name,
    avatar: row.avatar,
  };
}

export async function findUserByLogin(login: string): Promise<DbUser | null> {
  await ensureSchema();
  const q = sql();
  const rows = await q`SELECT id, email, phone, name, avatar FROM lite_users
    WHERE email = ${login} OR phone = ${login} LIMIT 1`;
  const row = rows[0];
  if (!row) return null;
  return {
    id: Number(row.id),
    email: row.email,
    phone: row.phone,
    name: row.name,
    avatar: row.avatar,
  };
}
