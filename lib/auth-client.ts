export type LiteUser = { email: string; name: string; pass: string };
export type PublicUser = { email: string; name: string; source: "lite" };

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
  localStorage.setItem(USERS, JSON.stringify(users));
}

function ping() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ice-auth"));
}

export function currentEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION);
}

export function currentUser(): LiteUser | null {
  const email = currentEmail();
  if (!email) return null;
  return readUsers().find((u) => u.email === email) || null;
}

export function listPublicUsers(): PublicUser[] {
  return readUsers().map((u) => ({ email: u.email, name: u.name, source: "lite" as const }));
}

export function signUp(email: string, password: string, name: string) {
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@") || password.length < 6) {
    throw new Error("Use a real email and a password at least 6 characters.");
  }
  const users = readUsers();
  if (users.some((u) => u.email === clean)) throw new Error("That email already has an account.");
  users.push({ email: clean, name: name.trim() || clean.split("@")[0], pass: password });
  writeUsers(users);
  localStorage.setItem(SESSION, clean);
  ping();
}

export function signIn(email: string, password: string) {
  const clean = email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === clean && u.pass === password);
  if (!user) throw new Error("Email or password is wrong.");
  localStorage.setItem(SESSION, user.email);
  ping();
  return user;
}

export function resetPassword(email: string, nextPassword: string) {
  const clean = email.trim().toLowerCase();
  if (nextPassword.length < 6) throw new Error("New password must be at least 6 characters.");
  const users = readUsers();
  const idx = users.findIndex((u) => u.email === clean);
  if (idx < 0) throw new Error("No Lite account with that email on this device.");
  users[idx] = { ...users[idx], pass: nextPassword };
  writeUsers(users);
}

export function signOut() {
  localStorage.removeItem(SESSION);
  ping();
}
