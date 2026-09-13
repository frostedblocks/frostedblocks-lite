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

function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Site ops: ADMIN_EMAILS match, or first account (id 1) when unset. */
export function isSiteAdmin(user: DbUser | null): boolean {
  if (!user) return false;
  const list = adminEmails();
  if (list.length) {
    return Boolean(user.email && list.includes(user.email.toLowerCase()));
  }
  return user.id === 1;
}

/**
 * Site-wide email confirm gate.
 * DB setting is source of truth. Env overrides:
 *   REQUIRE_EMAIL_VERIFY=1 force on
 *   REQUIRE_EMAIL_VERIFY=0 force off
 */
export async function emailVerifyRequired(): Promise<boolean> {
  const env = process.env.REQUIRE_EMAIL_VERIFY;
  if (env === "1") return true;
  if (env === "0") return false;
  if (!dbUrl()) return false;
  await ensureSchema();
  const q = sql();
  const rows = await q`SELECT value FROM lite_site_settings WHERE key = ${"email_verify_required"} LIMIT 1`;
  if (!rows[0]) return false;
  return String(rows[0].value) === "1";
}

export async function setEmailVerifyRequired(on: boolean): Promise<void> {
  await ensureSchema();
  const q = sql();
  const value = on ? "1" : "0";
  await q`INSERT INTO lite_site_settings (key, value, updated_at)
    VALUES (${"email_verify_required"}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()`;
}

export async function needsEmailVerify(user: DbUser): Promise<boolean> {
  if (!(await emailVerifyRequired())) return false;
  return Boolean(user.email) && !user.emailVerified;
}
