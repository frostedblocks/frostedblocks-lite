import { NextResponse } from "next/server";
import {
  emailVerifyRequired,
  isSiteAdmin,
  setEmailVerifyRequired,
  userFromRequest,
} from "@/lib/session";
import { publicError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const me = await userFromRequest(req);
    const required = await emailVerifyRequired();
    return NextResponse.json({
      required,
      canManage: isSiteAdmin(me),
      envLocked: process.env.REQUIRE_EMAIL_VERIFY === "1" || process.env.REQUIRE_EMAIL_VERIFY === "0",
    });
  } catch {
    return publicError(500, "Could not load email-confirm setting.");
  }
}

export async function POST(req: Request) {
  try {
    const me = await userFromRequest(req);
    if (!isSiteAdmin(me)) {
      return publicError(403, "Only the site admin can change this.");
    }
    if (process.env.REQUIRE_EMAIL_VERIFY === "1" || process.env.REQUIRE_EMAIL_VERIFY === "0") {
      return publicError(400, "REQUIRE_EMAIL_VERIFY is set in Vercel — remove it to use this switch.");
    }
    const body = await req.json().catch(() => ({}));
    const required = Boolean((body as { required?: boolean }).required);
    await setEmailVerifyRequired(required);
    return NextResponse.json({ required, canManage: true });
  } catch {
    return publicError(500, "Could not save email-confirm setting.");
  }
}
