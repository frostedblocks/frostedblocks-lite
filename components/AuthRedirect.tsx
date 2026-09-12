"use client";
import { useEffect } from "react";
import { refreshSession } from "@/lib/auth-client";

export function AuthRedirect() {
  useEffect(() => {
    void refreshSession().then((session) => {
      if (session.user) window.location.replace("/feed");
    });
  }, []);
  return null;
}
