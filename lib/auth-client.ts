export type LiteUser = {
  email: string;
  name: string;
  pass: string;
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
  localStorage.setItem(USERS, JSON.stringify(users));
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

export function currentEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION);
}

export function currentUser(): LiteUser | null {
  const id = currentEmail();
  if (!id) return null;
  return readUsers().find((u) => sameAccount(u, id)) || null;
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

export function signUp(login: string, password: string, name: string) {
  const clean = normalizeLogin(login);
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  if (!isEmail(clean) && !isPhone(clean)) {
    throw new Error("Use an email or a phone number (10 or more digits).");
  }
  const users = readUsers();
  if (users.some((u) => sameAccount(u, clean))) {
    throw new Error("That email or phone already has an account.");
  }
  const phone = isPhone(clean) ? clean : undefined;
  const email = isEmail(clean) ? clean : clean;
  users.push({
    email,
    phone,
    name: name.trim() || (isEmail(clean) ? clean.split("@")[0] : clean.slice(-4)),
    pass: password,
  });
  writeUsers(users);
  localStorage.setItem(SESSION, email);
  ping();
}

export function signIn(login: string, password: string) {
  const clean = normalizeLogin(login);
  const user = readUsers().find((u) => sameAccount(u, clean) && u.pass === password);
  if (!user) throw new Error("Email, phone, or password is wrong.");
  localStorage.setItem(SESSION, user.email);
  ping();
  return user;
}

export function signInWithGoogle(email: string, name: string, picture?: string) {
  const clean = normalizeLogin(email);
  if (!isEmail(clean)) throw new Error("Google did not return an email.");
  const users = readUsers();
  const idx = users.findIndex((u) => sameAccount(u, clean));
  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      name: users[idx].name || name || clean.split("@")[0],
      avatar: users[idx].avatar || picture,
      google: true,
    };
  } else {
    users.push({
      email: clean,
      name: name || clean.split("@")[0],
      pass: "",
      avatar: picture,
      google: true,
    });
  }
  writeUsers(users);
  localStorage.setItem(SESSION, clean);
  ping();
}

export function resetPassword(login: string, nextPassword: string) {
  const clean = normalizeLogin(login);
  if (nextPassword.length < 6) throw new Error("New password must be at least 6 characters.");
  const users = readUsers();
  const idx = users.findIndex((u) => sameAccount(u, clean));
  if (idx < 0) throw new Error("No Lite account with that email or phone on this device.");
  users[idx] = { ...users[idx], pass: nextPassword };
  writeUsers(users);
}

export function signOut() {
  localStorage.removeItem(SESSION);
  ping();
}
