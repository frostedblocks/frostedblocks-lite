export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://lite.frostedblocks.com").replace(/\/$/, "");
}

export async function sendMail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "ICE Lite <noreply@send.frostedblocks.com>";
  if (!key) throw new Error("RESEND_API_KEY is missing on Vercel.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Email failed (${res.status}). ${body.slice(0, 180)}`);
  }
}
