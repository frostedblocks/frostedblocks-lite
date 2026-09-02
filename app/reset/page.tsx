import { ResetForm } from "@/components/ResetForm";

export default function ResetPage() {
  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">Account</div>
        <h1 style={{ fontSize: 40 }}>Reset password</h1>
        <p className="lead">Enter the email on this device and pick a new password.</p>
        <ResetForm />
      </article>
    </main>
  );
}
