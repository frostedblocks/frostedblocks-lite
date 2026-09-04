import { GoogleFinish } from "@/components/GoogleFinish";

export default function GoogleAuthPage() {
  return (
    <main className="wrap page">
      <article className="glass auth-card">
        <div className="kicker">Gmail</div>
        <h1 style={{ fontSize: 40 }}>Signing you in</h1>
        <GoogleFinish />
      </article>
    </main>
  );
}
