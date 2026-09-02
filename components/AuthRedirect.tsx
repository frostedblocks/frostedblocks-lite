"use client";
import { useEffect } from "react";
import { currentUser } from "@/lib/auth-client";

export function AuthRedirect() {
  useEffect(() => {
    if (currentUser()) window.location.replace("/feed");
  }, []);
  return null;
}
