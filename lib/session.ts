import { cookies } from "next/headers";
import { dbUrl, ensureSchema, sql } from "./db";
import { isEmail, normalizeLogin, phoneKeys } from "./login";

export type DbUser = {
  id: number;
  email: string | null;
  phone: string | null;
  name: string;
  avatar: string | null;
  emailVerified: boolean;
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
    emailVerified: Boolean(row.email_verified) || (!row.email && Boolean(row.phone)),
  };
}

export async function userFromRequest(req?: Request): Promise<DbUser | null> {
  if (!dbUrl()) return null;
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
  const found = await q`SELECT u.id, u.email, u.phone, u.name, u.avatar, u.email_verified
    FROM lite_sessions s JOIN lite_users u ON u.id = s.user_id
    WHERE s.token = ${token} LIMIT 1`;
  return found[0] ? rowUser(found[0]) : null;
}

export async function findUserByLogin(login: string): Promise<DbUser | null> {
  if (!dbUrl()) return null;
  await ensureSchema();
  const raw = String(login || "").trim();
  if (!raw) return null;
  const q = sql();
  const handle = raw.match(/^u(\d+)$/i);
  if (handle) {
    const rows = await q`SELECT id, email, phone, name, avatar, email_verified FROM lite_users WHERE id = ${Number(handle[1])} LIMIT 1`;
    return rows[0] ? rowUser(rows[0]) : null;
  }
  const id = normalizeLogin(raw);
  const keys = phoneKeys(id);
  const rows = isEmail(id)
    ? await q`SELECT id, email, phone, name, avatar, email_verified FROM lite_users WHERE email = ${id} LIMIT 1`
    : keys.length
      ? await q`SELECT id, email, phone, name, avatar, email_verified FROM lite_users WHERE phone = ANY(${keys}) LIMIT 1`
      : [];
  return rows[0] ? rowUser(rows[0]) : null;
}

export function needsEmailVerify(user: DbUser) {
  return Boolean(user.email) && !user.emailVerified;
}
