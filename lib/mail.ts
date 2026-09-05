export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://lite.frostedblocks.com").replace(/\/$/, "");
}

const TEST_FROM = "ICE Lite <beth.t@example.com>";

export async function sendMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is missing on Vercel.");
  const preferred = process.env.MAIL_FROM || "ICE Lite <noreply@send.frostedblocks.com>";
  const first = await deliver(key, preferred, to, subject, text);
  if (first.ok) return;
  const needFallback =
    first.status === 403 &&
    /not verified|validation_error/i.test(first.body) &&
    preferred !== TEST_FROM;
  if (needFallback) {
    const second = await deliver(key, TEST_FROM, to, subject, text);
    if (second.ok) return;
    throw new Error(hint(second.status, second.body));
  }
  throw new Error(hint(first.status, first.body));
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
  if (status === 403 && /not verified/i.test(body)) {
    return "Resend will not send until you verify a domain at resend.com/domains, or send only to the email on that Resend account.";
  }
  return `Email failed (${status}). ${body.slice(0, 180)}`;
}
