import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export function Footer() {
  return (
    <footer className="site-footer wrap">
      <Link href="/about">About</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/contact">Contact</Link>
      <Link href="/network">Network</Link>
      <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">Open on chain</a>
    </footer>
  );
}
