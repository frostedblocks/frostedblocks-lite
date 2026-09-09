import { AuthForm } from "@/components/AuthForm";
import { AuthRedirect } from "@/components/AuthRedirect";

export default function SignUpPage() {
  return (
    <main className="wrap page">
      <AuthRedirect />
      <article className="glass auth-card">
        <div className="kicker">ICE Lite</div>
        <h1 style={{ fontSize: 40 }}>Create Lite account</h1>
        <p className="lead">Use an email you can open. We send a confirm link. You cannot post until you tap it.</p>
        <AuthForm mode="signup" />
      </article>
    </main>
  );
}
