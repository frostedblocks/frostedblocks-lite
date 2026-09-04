import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export function Footer() {
  return (
    <footer className="wrap glass footer">
      <span>ICE Lite · quiet social, free door</span>
      <nav>
        <Link href="/about">About</Link>
        <Link href="/join">How to join</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
        <a href={ONCHAIN_URL}>ICE Network</a>
      </nav>
    </footer>
  );
}
