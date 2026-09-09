"use client";
import { useEffect, useState } from "react";
import { currentUser, type LiteUser } from "./auth-client";

export function useAuth() {
  const [user, setUser] = useState<LiteUser | null>(null);
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(true);
  const [hasEmail, setHasEmail] = useState(false);

  useEffect(() => {
    const read = () => setUser(currentUser());
    read();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setVerified(Boolean(data.user.verified));
          setHasEmail(Boolean(data.user.hasEmail));
          if (data.user.name) {
            setUser((prev) => (prev ? { ...prev, name: data.user.name, avatar: data.user.avatar } : prev));
          }
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
    window.addEventListener("storage", read);
    window.addEventListener("ice-auth", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("ice-auth", read);
    };
  }, []);

  return { user, ready, signedIn: !!user, verified, hasEmail };
}
