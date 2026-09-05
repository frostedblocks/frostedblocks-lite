import { Suspense } from "react";
import { ResetForm } from "@/components/ResetForm";

export default function ResetPage() {
  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">Account</div>
        <h1 style={{ fontSize: 40 }}>Change password</h1>
        <p className="lead">Use the email link, or sign in and type the current password.</p>
        <Suspense fallback={<p className="note">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </article>
    </main>
  );
}
