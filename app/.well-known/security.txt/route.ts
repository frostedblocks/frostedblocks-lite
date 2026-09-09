export function GET() {
  const body = [
    "Contact: https://lite.frostedblocks.com/contact",
    "Expires: 2027-09-09T00:00:00.000Z",
    "Preferred-Languages: en",
    "Canonical: https://lite.frostedblocks.com/.well-known/security.txt",
    "Policy: https://lite.frostedblocks.com/privacy",
  ].join("\n");
  return new Response(body + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
