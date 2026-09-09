import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";

export function Footer() {
  return (
    <footer className="site-footer wrap">
      <Link href="/about">About</Link>
      <Link href="/join">Join</Link>
      <Link href="/partners">Resources</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/contact">Contact</Link>
      <a href="/rss.xml">RSS</a>
      <a className="quiet-link" href={ONCHAIN_URL} rel="noopener noreferrer">Open ICE Network</a>
    </footer>
  );
}
