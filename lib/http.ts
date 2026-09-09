import { NextResponse } from "next/server";

export function publicError(status: number, fallback: string) {
  return NextResponse.json({ error: fallback }, { status });
}

export function sessionCookie(res: NextResponse, token: string | null) {
  res.cookies.set("ice_lite_session", token || "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: token ? 60 * 60 * 24 * 7 : 0,
  });
  return res;
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}
