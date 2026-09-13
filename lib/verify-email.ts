import { ensureSchema, sql } from "@/lib/db";
import { hashToken } from "@/lib/token";

export type VerifyLookup = {
  tokenRow: string;
  userId: number;
};

/** Look up a still-valid verify token (hashed or legacy plain). */
export async function findVerifyToken(token: string): Promise<VerifyLookup | null> {
  if (!token) return null;
  await ensureSchema();
  const q = sql();
  const dig = hashToken(token);
  const rows = await q`SELECT token, user_id FROM lite_email_tokens
    WHERE (token = ${dig} OR token = ${token}) AND kind = ${"verify"} AND expires_at > NOW()
    LIMIT 1`;
  if (!rows.length) return null;
  return { tokenRow: String(rows[0].token), userId: Number(rows[0].user_id) };
}

/** Mark email verified and delete the one-time token. */
export async function consumeVerifyToken(token: string): Promise<boolean> {
  const found = await findVerifyToken(token);
  if (!found) return false;
  const q = sql();
  await q`UPDATE lite_users SET email_verified = TRUE WHERE id = ${found.userId}`;
  await q`DELETE FROM lite_email_tokens WHERE token = ${found.tokenRow}`;
  return true;
}

/**
 * Same-browser confirm: only when the signed-in user owns this token.
 * Mail scanners prefetch without cookies, so they never hit this path.
 */
export async function consumeVerifyTokenForUser(token: string, userId: number): Promise<boolean> {
  const found = await findVerifyToken(token);
  if (!found) return false;
  if (found.userId !== userId) return false;
  const q = sql();
  await q`UPDATE lite_users SET email_verified = TRUE WHERE id = ${found.userId}`;
  await q`DELETE FROM lite_email_tokens WHERE token = ${found.tokenRow}`;
  return true;
}
