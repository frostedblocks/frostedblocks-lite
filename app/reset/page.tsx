import { ResetForm } from "@/components/ResetForm";

export default function ResetPage() {
  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">Account</div>
        <h1 style={{ fontSize: 40 }}>Change password</h1>
        <p className="lead">Signed-in users only. Prove the current password first.</p>
        <ResetForm />
      </article>
    </main>
  );
}
