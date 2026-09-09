import type { DbUser } from "./session";
import { needsEmailVerify } from "./session";
import { publicError } from "./http";

export function denyUnverified(user: DbUser | null) {
  if (!user) return publicError(401, "Sign in first.");
  if (needsEmailVerify(user)) {
    return publicError(403, "Confirm your email first. Check your inbox, then try again.");
  }
  return null;
}
