import { AuthForm } from "@/components/AuthForm";
import { AuthRedirect } from "@/components/AuthRedirect";

export default function SignInPage() {
  return (
    <main className="wrap page">
      <AuthRedirect />
      <article className="glass auth-card">
        <div className="kicker">Web2 account</div>
        <h1 style={{ fontSize: 40 }}>Sign in</h1>
        <p className="lead">Use the email or phone and password you created on Lite.</p>
        <AuthForm mode="signin" />
      </article>
    </main>
  );
}
