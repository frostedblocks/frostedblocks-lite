export type LiteMessage = {
  id: string;
  from: string;
  fromName?: string;
  to: string;
  toName?: string;
  text: string;
  at: number;
};

export async function listAllMessages(): Promise<{ me: string; messages: LiteMessage[] }> {
  const res = await fetch("/api/messages", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load messages.");
  return { me: data.me || "", messages: (data.messages || []) as LiteMessage[] };
}

export function listThreads(me: string, messages: LiteMessage[]) {
  const mine = messages.filter((m) => m.from === me || m.to === me);
  const map = new Map<string, LiteMessage>();
  for (const m of mine) {
    const other = m.from === me ? m.to : m.from;
    const prev = map.get(other);
    if (!prev || m.at > prev.at) map.set(other, m);
  }
  return [...map.entries()]
    .map(([handle, last]) => ({
      handle,
      name: last.from === handle ? last.fromName : last.toName,
      last,
    }))
    .sort((a, b) => b.last.at - a.last.at);
}

export function listThread(me: string, other: string, messages: LiteMessage[]) {
  return messages
    .filter((m) => (m.from === me && m.to === other) || (m.from === other && m.to === me))
    .sort((a, b) => a.at - b.at);
}

export async function sendMessage(_from: string, to: string, text: string) {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not send.");
  return data.message as LiteMessage;
}
