import { NextResponse } from "next/server";
import { needsEmailVerify, userFromRequest } from "@/lib/session";

export async function GET(req: Request) {
  const me = await userFromRequest(req);
  if (!me) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      name: me.name,
      avatar: me.avatar,
      verified: !needsEmailVerify(me),
      hasEmail: Boolean(me.email),
    },
  });
}
