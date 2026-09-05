export type LiteUser = {
  email: string;
  name: string;
  pass?: string;
  phone?: string;
  avatar?: string;
  google?: boolean;
};
export type PublicUser = { email: string; name: string; source: "lite"; avatar?: string };

const USERS = "ice-lite-users";
const SESSION = "ice-lite-session";

function readUsers(): LiteUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS) || "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: LiteUser[]) {
  localStorage.setItem(USERS, JSON.stringify(users.map(({ pass, ...rest }) => rest)));
}

function ping() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ice-auth"));
}

export function normalizeLogin(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  if (value.includes("@")) return value.toLowerCase();
  const keepPlus = value.startsWith("+") ? "+" : "";
  return keepPlus + value.replace(/\D/g, "");
}

export function isEmail(value: string) {
  return value.includes("@") && value.includes(".");
}

export function isPhone(value: string) {
  return /^\+?\d{10,15}$/.test(value);
}

function sameAccount(user: LiteUser, login: string) {
  return user.email === login || user.phone === login;
}

function cacheUser(user: LiteUser) {
  const users = readUsers().filter((u) => !sameAccount(u, user.email));
  users.push({ email: user.email, name: user.name, avatar: user.avatar, phone: user.phone });
  writeUsers(users);
  localStorage.setItem(SESSION, user.email);
  ping();
}

export function currentEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION);
}

export function currentUser(): LiteUser | null {
  const id = currentEmail();
  if (!id) return null;
  return readUsers().find((u) => sameAccount(u, id)) || { email: id, name: id.split("@")[0] };
}

export function listPublicUsers(): PublicUser[] {
  return readUsers().map((u) => ({
    email: u.email,
    name: u.name,
    source: "lite" as const,
    avatar: u.avatar,
  }));
}

export function setAvatar(url: string) {
  const me = currentUser();
  if (!me) throw new Error("Sign in first.");
  const users = readUsers();
  const idx = users.findIndex((u) => sameAccount(u, me.email));
  if (idx < 0) throw new Error("Account not found.");
  users[idx] = { ...users[idx], avatar: url || undefined };
  writeUsers(users);
  ping();
}

export function clearAvatar() {
  setAvatar("");
}

export function avatarFor(author: string) {
  return readUsers().find((u) => sameAccount(u, author))?.avatar || "";
}

export async function signUp(login: string, password: string, name: string) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not sign up.");
  cacheUser(data);
}

export async function signIn(login: string, password: string) {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    body: JSON.stringify({ currentPassword, password: nextPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not change password.");
}

export function signInWithGoogle(email: string, name: string, picture?: string) {
  cacheUser({ email: normalizeLogin(email), name, avatar: picture, google: true });
}

export async function signOut() {
  localStorage.removeItem(SESSION);
  ping();
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* already cleared locally */
  }
}
