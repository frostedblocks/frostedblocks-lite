import { createHash, randomBytes } from "crypto";

/** Random opaque token for email links (sent to the user). */
export function newEmailToken(bytes = 24) {
  return randomBytes(bytes).toString("hex");
}

/** SHA-256 hex digest stored in lite_email_tokens.token. */
export function hashToken(token: string) {
  return createHash("sha256").update(String(token || ""), "utf8").digest("hex");
}
