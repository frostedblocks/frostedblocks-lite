"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthButtons } from "./AuthButtons";
import { currentUser } from "@/lib/auth-client";

export function Header() {
  const [home, setHome] = useState("/");
  useEffect(() => {
    setHome(currentUser() ? "/feed" : "/");
  }, []);

  return (
    <header className="wrap glass header">
      <Link className="brand" href={home}>
        <div className="logo">ICE</div>
        <div>
          <b>ICE Lite</b>
          <span>frostedblocks.com</span>
        </div>
      </Link>
      <nav className="nav">
        <Link href="/join">How to join</Link>
        <Link href="/about">About</Link>
        <Link className="btn ghost" href="/feed">Live feed</Link>
        <AuthButtons />
      </nav>
    </header>
  );
}
