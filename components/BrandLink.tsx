"use client";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

export function BrandLink() {
  const { signedIn } = useAuth();
  return (
    <Link className="brand" href={signedIn ? "/feed" : "/"}>
      <div className="logo">ICE</div>
      <div>
        <b>ICE Lite</b>
        <span>frostedblocks.com</span>
      </div>
    </Link>
  );
}
