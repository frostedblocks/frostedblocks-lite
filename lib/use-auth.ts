"use client";
import { useEffect, useState } from "react";
import { currentUser, type LiteUser } from "./auth-client";

export function useAuth() {
  const [user, setUser] = useState<LiteUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => setUser(currentUser());
    read();
    setReady(true);
    window.addEventListener("storage", read);
    window.addEventListener("ice-auth", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("ice-auth", read);
    };
  }, []);

  return { user, ready, signedIn: !!user };
}
