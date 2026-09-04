import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const here = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${here.protocol}//${here.host}`;
  const code = here.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/signin?error=google`);

  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) return NextResponse.redirect(`${origin}/signin?error=google-config`);

  const redirectUri = `${origin}/api/auth/google/callback`;
  const body = new URLSearchParams({
    code,
    client_id: id,
    client_secret: secret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const tokens = await tokenRes.json();
  if (!tokens.access_token) return NextResponse.redirect(`${origin}/signin?error=google-token`);

  const meRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const me = await meRes.json();
  if (!me.email) return NextResponse.redirect(`${origin}/signin?error=google-email`);

  const next = new URL("/auth/google", origin);
  next.searchParams.set("email", me.email);
  next.searchParams.set("name", me.name || "");
  if (me.picture) next.searchParams.set("picture", me.picture);
  return NextResponse.redirect(next.toString());
}
