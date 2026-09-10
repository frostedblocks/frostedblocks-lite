export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://lite.frostedblocks.com").replace(/\/$/, "");
}

const TEST_FROM = "ICE Lite <beth.t@example.com>";
const APEX_FROM = "ICE Lite <noreply@frostedblocks.com>";
const SEND_FROM = "ICE Lite <noreply@send.frostedblocks.com>";

export async function sendMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is missing on Vercel.");
  const preferred = process.env.MAIL_FROM || APEX_FROM;
  const tried = new Set<string>();
  const order = [preferred, APEX_FROM, SEND_FROM];
  let last = { ok: false, status: 0, body: "" };
  for (const from of order) {
    if (tried.has(from)) continue;
    tried.add(from);
    last = await deliver(key, from, to, subject, text);
    if (last.ok) return;
  }
  const needFallback =
    last.status === 403 && /not verified|validation_error|only send testing/i.test(last.body);
  if (needFallback && !tried.has(TEST_FROM)) {
    const second = await deliver(key, TEST_FROM, to, subject, text);
    if (second.ok) return;
    throw new Error(hint(second.status, second.body));
  }
  throw new Error(hint(last.status, last.body));
}

async function deliver(key: string, from: string, to: string, subject: string, text: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

function hint(status: number, body: string) {
  if (status === 403 && /not verified|only send testing/i.test(body)) {
    return "Resend rejected the from-address. In Vercel set MAIL_FROM to ICE Lite <noreply@frostedblocks.com> and confirm frostedblocks.com is Verified in Resend.";
  }
  return `Email failed (${status}). ${body.slice(0, 180)}`;
}
