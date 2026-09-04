import { NextResponse } from "next/server";
import { putAvatar } from "@/lib/r2";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function flags() {
  return {
    R2_ACCOUNT_ID: Boolean(process.env.R2_ACCOUNT_ID),
    R2_ACCESS_KEY_ID: Boolean(process.env.R2_ACCESS_KEY_ID),
    R2_SECRET_ACCESS_KEY: Boolean(process.env.R2_SECRET_ACCESS_KEY),
    R2_BUCKET: Boolean(process.env.R2_BUCKET),
    R2_PUBLIC_URL: Boolean(process.env.R2_PUBLIC_URL),
  };
}

export async function GET() {
  return NextResponse.json({ ok: true, env: flags() });
}

export async function POST(req: Request) {
  try {
    const missing = Object.entries(flags())
      .filter(([, on]) => !on)
      .map(([name]) => name);
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing on this deploy: ${missing.join(", ")}. Add them in Vercel Environment Variables for Production AND Preview, then Redeploy.` },
        { status: 500 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const login = String(form.get("login") || "").trim();
    if (!(file instanceof File)) return NextResponse.json({ error: "Pick a photo." }, { status: 400 });
    if (!login) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    const ext = TYPES[file.type];
    if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, or WEBP." }, { status: 400 });
    if (file.size > 2_000_000) return NextResponse.json({ error: "Photo must be under 2MB." }, { status: 400 });

    const safe = login.replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 40);
    const key = `avatars/${safe}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const url = await putAvatar(key, buf, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
