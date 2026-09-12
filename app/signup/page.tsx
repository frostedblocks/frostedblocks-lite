import { AuthForm } from "@/components/AuthForm";
import { AuthRedirect } from "@/components/AuthRedirect";
import { GoogleButton } from "@/components/GoogleButton";

export default function SignUpPage() {
  return (
    <main className="wrap page">
      <AuthRedirect />
      <article className="glass auth-card">
        <div className="kicker">ICE Lite</div>
        <h1 style={{ fontSize: 40 }}>Create Lite account</h1>
        <p className="lead">Email and a password. Confirm the link we send before posting. Or continue with Google.</p>
        <AuthForm mode="signup" />
        <GoogleButton />
      </article>
    </main>
  );
}
