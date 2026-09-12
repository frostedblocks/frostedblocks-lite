"use client";
import { useEffect, useState } from "react";
import { currentUser, refreshSession, sessionFlags, type LiteUser } from "./auth-client";

export function useAuth() {
  const [user, setUser] = useState<LiteUser | null>(null);
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(true);
  const [hasEmail, setHasEmail] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applyFlags = () => {
      const flags = sessionFlags();
      setUser(currentUser());
      setVerified(flags.verified);
      setHasEmail(flags.hasEmail);
    };

    refreshSession()
      .then(() => {
        if (cancelled) return;
        applyFlags();
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    // Keep verified/hasEmail in sync when other code refreshes the session
    // (without re-fetching — sessionFlags is updated inside refreshSession).
    window.addEventListener("ice-auth", applyFlags);
    return () => {
      cancelled = true;
      window.removeEventListener("ice-auth", applyFlags);
    };
  }, []);

  return { user, ready, signedIn: !!user, verified, hasEmail };
}
