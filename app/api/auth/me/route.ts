import { NextResponse } from "next/server";
import { needsEmailVerify, userFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
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
  } catch {
    return NextResponse.json({ user: null });
  }
}
