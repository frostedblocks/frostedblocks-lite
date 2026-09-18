"use client";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

export function BrandLink() {
  const { signedIn } = useAuth();
  return (
    <Link className="brand" href={signedIn ? "/circles" : "/"}>
      <div className="logo" aria-hidden="true"><span className="logo-mark" /></div>
      <div>
        <b>ICE Lite</b>
        <span>Circles</span>
      </div>
    </Link>
  );
}
