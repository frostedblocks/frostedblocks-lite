import { AuthForm } from "@/components/AuthForm";
import { AuthRedirect } from "@/components/AuthRedirect";

export default function SignUpPage() {
  return (
    <main className="wrap page">
      <AuthRedirect />
      <article className="glass auth-card">
        <div className="kicker">ICE Lite</div>
        <h1 style={{ fontSize: 40 }}>Create Lite account</h1>
        <p className="lead">Email or phone and a password. Free. No wallet. About a minute.</p>
        <AuthForm mode="signup" />
      </article>
    </main>
  );
}
