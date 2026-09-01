export type LiteUser = { email: string; name: string; pass: string };

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

export function currentEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION);
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
}

export function signIn(email: string, password: string) {
  const clean = email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === clean && u.pass === password);
  if (!user) throw new Error("Email or password is wrong.");
  localStorage.setItem(SESSION, user.email);
  return user;
}

export function signOut() {
  localStorage.removeItem(SESSION);
}

export function currentUser(): LiteUser | null {
  const email = currentEmail();
  if (!email) return null;
  return readUsers().find((u) => u.email === email) || null;
}
