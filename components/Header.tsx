import Link from "next/link";
import { ONCHAIN_URL } from "@/lib/canisters";
export function Header() {
  return (
    <header className="wrap glass header">
      <Link className="brand" href="/">
        <div className="logo">ICE</div>
        <div><b>ICE Lite</b><span>frostedblocks.com</span></div>
      </Link>
      <nav className="nav">
        <Link href="/join">How to join</Link>
        <Link href="/about">About</Link>
        <a className="btn ghost" href={ONCHAIN_URL}>On-chain ICE</a>
      </nav>
    </header>
  );
}
