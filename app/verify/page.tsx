import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmEmail } from "@/components/ConfirmEmail";
import { needsEmailVerify, userFromRequest } from "@/lib/session";
import { consumeVerifyTokenForUser } from "@/lib/verify-email";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string; ok?: string; error?: string };
}) {
  const token = searchParams.token || "";

  let me = null;
  try {
    me = await userFromRequest();
  } catch {
    me = null;
  }

  // Same-browser shortcut: session cookie present + token owned by this user → confirm now.
  // Mail scanners prefetch without cookies, so they never auto-consume.
  // Note: redirect() throws — never wrap it in try/catch.
  if (token) {
    if (me && !(await needsEmailVerify(me))) {
      redirect("/verify?ok=1");
    }
    if (me) {
      let consumed = false;
      try {
        consumed = await consumeVerifyTokenForUser(token, me.id);
      } catch {
        consumed = false;
      }
      if (consumed) redirect("/verify?ok=1");
    }
    return (
      <main className="wrap page">
        <ConfirmEmail token={token} />
      </main>
    );
  }

  // Soft recovery: signed-in + already verified + landed on error → treat as success.
  if (searchParams.error && me && !(await needsEmailVerify(me))) {
    redirect("/verify?ok=1");
  }

  const ok = searchParams.ok === "1";

  // Success page: if still unverified in this session, don't fake it.
  if (ok && me && (await needsEmailVerify(me))) {
    return (
      <main className="wrap page">
        <article className="glass auth-card">
          <div className="kicker">Email</div>
          <h1 style={{ fontSize: 40 }}>Still need a confirm</h1>
          <p className="lead">
            This browser still shows an unconfirmed email. Open the newest link from your inbox on the
            device where you’re signed in, or send a new one from the feed.
          </p>
          <p style={{ marginTop: 20 }}>
            <Link className="btn" href="/feed">
              Open live feed
            </Link>
          </p>
        </article>
      </main>
    );
  }

  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">Email</div>
        <h1 style={{ fontSize: 40 }}>{ok ? "Email confirmed" : "Link did not work"}</h1>
        <p className="lead">
          {ok
            ? "You can post, follow, and message on ICE Lite now."
            : "That confirm link is old or already used. Sign in and tap Send confirm email on the feed."}
        </p>
        <p style={{ marginTop: 20 }}>
          <Link className="btn" href="/feed">
            Open live feed
          </Link>
        </p>
      </article>
    </main>
  );
}
