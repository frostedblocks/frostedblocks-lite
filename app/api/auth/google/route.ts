import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID is missing on Vercel. Add it, then Redeploy." },
      { status: 500 },
    );
  }
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
  const redirect = `${origin}/api/auth/google/callback`;
  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.searchParams.set("client_id", id);
  google.searchParams.set("redirect_uri", redirect);
  google.searchParams.set("response_type", "code");
  google.searchParams.set("scope", "openid email profile");
  google.searchParams.set("prompt", "select_account");
  return NextResponse.redirect(google.toString());
}
