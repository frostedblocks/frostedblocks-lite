import { normalizeLogin } from "./login";

export type LiteUser = {
  email: string;
  name: string;
  pass?: string;
  phone?: string;
  avatar?: string;
  google?: boolean;
};
export type PublicUser = { email: string; name: string; source: "lite"; avatar?: string };

const LEGACY_USERS = "ice-lite-users";
const LEGACY_SESSION = "ice-lite-session";
export const MAIL_FAILED_KEY = "ice-lite-mail-failed";

/** In-tab only — never written to localStorage. */
let memoryUser: LiteUser | null = null;

function ping() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ice-auth"));
}

/** Drop old client caches that stored email/phone on disk. */
export function clearLegacyLocalAuth() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_USERS);
    localStorage.removeItem(LEGACY_SESSION);
  } catch {
    /* ignore quota / private mode */
  }
}

export { normalizeLogin, isEmail, isPhone } from "./login";

function cacheUser(user: LiteUser) {
  clearLegacyLocalAuth();
  const login = normalizeLogin(user.email || user.phone || "");
  memoryUser = {
    email: login,
    name: user.name,
    avatar: user.avatar,
    phone: user.phone ? normalizeLogin(user.phone) : undefined,
    google: user.google,
  };
  ping();
}

export function currentEmail(): string | null {
  return memoryUser?.email || null;
}

export function currentUser(): LiteUser | null {
  return memoryUser;
}

export function listPublicUsers(): PublicUser[] {
  return memoryUser
    ? [
        {
          email: memoryUser.email,
          name: memoryUser.name,
          source: "lite" as const,
          avatar: memoryUser.avatar,
        },
      ]
    : [];
}

export function setAvatar(url: string) {
  if (!memoryUser) throw new Error("Sign in first.");
  memoryUser = { ...memoryUser, avatar: url || undefined };
  clearLegacyLocalAuth();
  ping();
}

export function clearAvatar() {
  setAvatar("");
}

export function avatarFor(author: string) {
  if (!memoryUser) return "";
  const id = normalizeLogin(author);
  if (normalizeLogin(memoryUser.email) === id || normalizeLogin(memoryUser.phone || "") === id) {
    return memoryUser.avatar || "";
  }
  return "";
}

export type SessionInfo = {
  user: LiteUser | null;
  verified: boolean;
  hasEmail: boolean;
};

/** Source of truth: HttpOnly cookie via /api/auth/me. */
export async function refreshSession(): Promise<SessionInfo> {
  clearLegacyLocalAuth();
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
    const data = await res.json();
    const login = String(data.user?.login || "");
    if (!login) {
      memoryUser = null;
      ping();
      return { user: null, verified: true, hasEmail: false };
    }
    cacheUser({
      email: normalizeLogin(login),
      name: data.user.name || "Lite user",
      avatar: data.user.avatar || undefined,
      phone:
        data.user.hasEmail === false && !String(login).includes("@")
          ? normalizeLogin(login)
          : undefined,
    });
    return {
      user: memoryUser,
      verified: Boolean(data.user.verified),
      hasEmail: Boolean(data.user.hasEmail),
    };
  } catch {
    memoryUser = null;
    ping();
    return { user: null, verified: true, hasEmail: false };
  }
}

export async function signUp(login: string, password: string, name: string) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ login, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not sign up.");
  cacheUser(data);
  if (data.mailed === false && typeof window !== "undefined") {
    sessionStorage.setItem(MAIL_FAILED_KEY, "1");
  }
  return data;
}

export async function signIn(login: string, password: string) {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not sign in.");
  cacheUser(data);
  return data;
}

export async function resetPassword(currentPassword: string, nextPassword: string) {
  const res = await fetch("/api/auth/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, password: nextPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not change password.");
}

/** Finish Google OAuth after the server set the session cookie (no PII in the URL). */
export async function finishGoogleSession() {
  const session = await refreshSession();
  if (!session.user) throw new Error("Google sign-in failed. Try again.");
  memoryUser = { ...session.user, google: true };
  ping();
}

export async function updateDisplayName(name: string) {
  const res = await fetch("/api/auth/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not save name.");
  if (memoryUser) cacheUser({ ...memoryUser, name: data.name || name });
  return String(data.name || name);
}

export async function requestAccountDelete(note?: string) {
  const res = await fetch("/api/auth/delete-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ note: note || "" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not send delete request.");
}

/** Permanently delete this Lite account (posts, follows, messages, sessions). */
export async function deleteAccount(confirm: string, password?: string) {
  const res = await fetch("/api/auth/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ confirm, password: password || "" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not delete account.");
  memoryUser = null;
  clearLegacyLocalAuth();
  ping();
}

export async function signOut() {
  memoryUser = null;
  clearLegacyLocalAuth();
  ping();
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* already cleared locally */
  }
}

export async function signOutEverywhere() {
  memoryUser = null;
  clearLegacyLocalAuth();
  ping();
  try {
    await fetch("/api/auth/logout?all=1", { method: "POST", credentials: "include" });
  } catch {
    /* already cleared locally */
  }
}
