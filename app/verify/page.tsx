import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmEmail } from "@/components/ConfirmEmail";
import { needsEmailVerify, userFromRequest } from "@/lib/session";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string; ok?: string; error?: string };
}) {
  // Show tap-to-confirm — do not auto-hit the verify API (mail scanners burn GET links).
  if (searchParams.token) {
    return (
      <main className="wrap page">
        <ConfirmEmail token={searchParams.token} />
      </main>
    );
  }

  // Soft recovery: signed-in + already verified + landed on error → treat as success.
  if (searchParams.error) {
    try {
      const me = await userFromRequest();
      if (me && !needsEmailVerify(me)) {
        redirect("/verify?ok=1");
      }
    } catch {
      /* show error UI */
    }
  }

  const ok = searchParams.ok === "1";
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
