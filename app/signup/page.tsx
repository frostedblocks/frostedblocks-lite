import { AuthForm } from "@/components/AuthForm";
import { AuthRedirect } from "@/components/AuthRedirect";

export default function SignUpPage() {
  return (
    <main className="wrap page">
      <AuthRedirect />
      <article className="glass auth-card">
        <div className="kicker">Web2 account</div>
        <h1 style={{ fontSize: 40 }}>Sign up</h1>
        <p className="lead">Email or phone, plus a password. No wallet. This site is not on-chain.</p>
        <AuthForm mode="signup" />
      </article>
    </main>
  );
}
