import { NextResponse } from "next/server";
import { needsEmailVerify, userFromRequest } from "@/lib/session";
import { maybeTrackDay1Return } from "@/lib/events";

export const dynamic = "force-dynamic";

function noStore(data: unknown, init?: ResponseInit) {
  const res = NextResponse.json(data, init);
  res.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return res;
}

export async function GET(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!me) return noStore({ user: null });
    await maybeTrackDay1Return(me.id);
    return noStore({
      user: {
        login: me.email || me.phone || "",
        name: me.name,
        avatar: me.avatar,
        verified: !(await needsEmailVerify(me)),
        hasEmail: Boolean(me.email),
      },
    });
  } catch {
    return noStore({ user: null });
  }
}
