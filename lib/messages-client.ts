export type LiteMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  at: number;
};

const KEY = "ice-lite-messages";

function read(): LiteMessage[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(rows: LiteMessage[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function threadId(a: string, b: string) {
  return [a.toLowerCase(), b.toLowerCase()].sort().join("|");
}

export function listThreads(me: string) {
  const mine = read().filter((m) => m.from === me || m.to === me);
  const map = new Map<string, LiteMessage>();
  for (const m of mine) {
    const other = m.from === me ? m.to : m.from;
    const prev = map.get(other);
    if (!prev || m.at > prev.at) map.set(other, m);
  }
  return [...map.entries()]
    .map(([email, last]) => ({ email, last }))
    .sort((a, b) => b.last.at - a.last.at);
}

export function listThread(me: string, other: string) {
  return read()
    .filter(
      (m) =>
        (m.from === me && m.to === other) ||
        (m.from === other && m.to === me),
    )
    .sort((a, b) => a.at - b.at);
}

export function sendMessage(from: string, to: string, text: string) {
  const body = text.trim();
  if (!from) throw new Error("Sign in to send a message.");
  if (!to.includes("@")) throw new Error("Messages on Lite are email to email.");
  if (from === to) throw new Error("You cannot message yourself.");
  if (!body) throw new Error("Write a message first.");
  const row: LiteMessage = {
    id: `msg-${Date.now()}`,
    from,
    to: to.toLowerCase(),
    text: body.slice(0, 2000),
    at: Date.now(),
  };
  write([...read(), row]);
  return row;
}
