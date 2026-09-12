import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function allowedOrigin(origin: string) {
  try {
    const host = new URL(origin).host.toLowerCase();
    return (
      host === "lite.frostedblocks.com" ||
      host.endsWith(".vercel.app") ||
      host === "localhost:3000"
    );
  } catch {
    return false;
  }
}

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    // Nonce + strict-dynamic: no script unsafe-inline. Next applies the nonce to its scripts.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "script-src-attr 'none'",
    // React style={{ }} needs unsafe-inline; linked CSS stays on 'self'.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://icp-api.io https://ic0.app https://*.icp0.io https://api.pwnedpasswords.com",
    "font-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function middleware(req: NextRequest) {
  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (mutating && req.nextUrl.pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    if (origin) {
      if (!allowedOrigin(origin)) {
        return NextResponse.json({ error: "Request blocked." }, { status: 403 });
      }
    } else {
      const site = (req.headers.get("sec-fetch-site") || "").toLowerCase();
      if (site !== "same-origin" && site !== "same-site" && site !== "none") {
        return NextResponse.json({ error: "Request blocked." }, { status: 403 });
      }
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
