import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { AuthRedirect } from "@/components/AuthRedirect";
import { GoogleButton } from "@/components/GoogleButton";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a free ICE Lite account — email signup, post free.",
  alternates: { canonical: "/signup" },
  openGraph: {
    title: "Sign up | ICE Lite",
    description: "Create a free ICE Lite account — email signup, post free.",
    url: "/signup",
  },
};

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
