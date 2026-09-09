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

export function middleware(req: NextRequest) {
  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (!mutating || !req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  const origin = req.headers.get("origin");
  if (origin && !allowedOrigin(origin)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
