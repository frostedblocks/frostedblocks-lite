"use client";
import { useEffect, useState } from "react";
import { currentUser, refreshSession, type LiteUser } from "./auth-client";

export function useAuth() {
  const [user, setUser] = useState<LiteUser | null>(null);
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(true);
  const [hasEmail, setHasEmail] = useState(false);

  useEffect(() => {
    const read = () => setUser(currentUser());
    let cancelled = false;
    refreshSession()
      .then((session) => {
        if (cancelled) return;
        setUser(session.user);
        setVerified(session.verified);
        setHasEmail(session.hasEmail);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    window.addEventListener("ice-auth", read);
    return () => {
      cancelled = true;
      window.removeEventListener("ice-auth", read);
    };
  }, []);

  return { user, ready, signedIn: !!user, verified, hasEmail };
}
