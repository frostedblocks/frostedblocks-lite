"use client";
import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/auth-client";

export function GoogleFinish() {
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || "";
    const name = params.get("name") || "";
    const picture = params.get("picture") || "";
    try {
      signInWithGoogle(email, name, picture || undefined);
      window.location.replace("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  }, []);

  if (error) return <p className="error">{error}</p>;
  return <p className="note">Finishing Gmail login…</p>;
}
