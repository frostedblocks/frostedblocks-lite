import { AuthForm } from "@/components/AuthForm";
import { AuthRedirect } from "@/components/AuthRedirect";
import { GoogleButton } from "@/components/GoogleButton";

export default function SignInPage() {
  return (
    <main className="wrap page">
      <AuthRedirect />
      <article className="glass auth-card">
        <div className="kicker">ICE Lite</div>
        <h1 style={{ fontSize: 40 }}>Sign in</h1>
        <p className="lead">Email and password. Existing phone accounts can still sign in with phone.</p>
        <AuthForm mode="signin" />
        <GoogleButton />
      </article>
    </main>
  );
}
