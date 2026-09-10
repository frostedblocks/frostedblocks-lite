import { ForgotForm } from "@/components/ForgotForm";

export default function ForgotPage() {
  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">Account</div>
        <h1 style={{ fontSize: 40 }}>Forgot password</h1>
        <p className="lead">We email a reset link to the address on the account. Check spam. Phone-only accounts cannot use this.</p>
        <ForgotForm />
      </article>
    </main>
  );
}
