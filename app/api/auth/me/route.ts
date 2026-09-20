import { NextResponse } from "next/server";
import { needsEmailVerify, userFromRequest } from "@/lib/session";
import { maybeTrackDay1Return } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return NextResponse.json({ user: null });
    await maybeTrackDay1Return(me.id);
    return NextResponse.json({
      user: {
        login: me.email || me.phone || "",
        name: me.name,
        avatar: me.avatar,
        verified: !(await needsEmailVerify(me)),
        hasEmail: Boolean(me.email),
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
