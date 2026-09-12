"use client";
import { useEffect, useState } from "react";
import { finishGoogleSession } from "@/lib/auth-client";

export function GoogleFinish() {
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await finishGoogleSession();
        if (!cancelled) window.location.replace("/feed");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Google sign-in failed.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="error">{error}</p>;
  return <p className="note">Finishing Gmail login…</p>;
}
